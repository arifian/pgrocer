import type { CharacterReport, GroceryEntry, Recipe, TierBucket } from './types.js';
import { normalizeName } from './skills.js';

export interface BuildOpts {
  tierSize?: number;
  capLevel?: number;
}

export function buildTiers(recipes: Recipe[], opts: BuildOpts = {}): TierBucket[] {
  const tierSize = opts.tierSize ?? 10;
  const maxLevel = recipes.reduce((m, r) => Math.max(m, r.level), 0);
  const cap = opts.capLevel ?? maxLevel;
  const buckets: TierBucket[] = [];
  for (let min = 0; min <= cap; min += tierSize) {
    const max = Math.min(min + tierSize - 1, cap);
    buckets.push({
      label: `Lvl ${min}-${max}`,
      minLevel: min,
      maxLevel: max,
      recipes: [],
      grocery: [],
    });
  }
  for (const r of recipes) {
    const idx = Math.floor(r.level / tierSize);
    if (idx >= buckets.length) continue;
    buckets[idx].recipes.push(r);
  }
  return buckets;
}

export function filterIncomplete(
  recipes: Recipe[],
  completions: Record<string, number>,
): Recipe[] {
  const byNorm = new Map<string, number>();
  for (const [key, val] of Object.entries(completions)) {
    byNorm.set(normalizeName(key), val);
  }
  const out: Recipe[] = [];
  for (const r of recipes) {
    const count = byNorm.get(normalizeName(r.name));
    if (count === undefined) continue;
    if (count === 0) out.push(r);
  }
  return out;
}

export function aggregateGrocery(recipes: Recipe[]): GroceryEntry[] {
  const map = new Map<string, GroceryEntry>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      const existing = map.get(ing.name);
      if (existing) {
        existing.qty += ing.qty;
        existing.fromRecipes.push(r.name);
      } else {
        map.set(ing.name, {
          ingredient: ing.name,
          qty: ing.qty,
          fromRecipes: [r.name],
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty);
}

export function buildGroceryByTier(
  recipes: Recipe[],
  character: CharacterReport,
  opts: BuildOpts = {},
): TierBucket[] {
  const incomplete = filterIncomplete(recipes, character.RecipeCompletions);
  const tiers = buildTiers(incomplete, opts);
  for (const t of tiers) {
    t.grocery = aggregateGrocery(t.recipes);
  }
  return tiers;
}
