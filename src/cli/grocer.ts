import { getSkill } from '../skills.js';
import { getRecipes } from '../scraper/cache.js';
import { findCharacterFile, loadCharacter } from '../character-node.js';
import { buildGroceryByTier } from '../grocery.js';
import type { TierBucket } from '../types.js';

interface Args {
  skill: string;
  characterFile?: string;
  refresh: boolean;
  showRecipes: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { skill: 'cooking', refresh: false, showRecipes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill' || a === '-s') args.skill = argv[++i];
    else if (a === '--file' || a === '-f') args.characterFile = argv[++i];
    else if (a === '--refresh' || a === '-r') args.refresh = true;
    else if (a === '--recipes') args.showRecipes = true;
    else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`pgrocer — Project Gorgon grocery list generator

Usage: npm run grocer -- [options]

Options:
  -s, --skill <name>    Skill to analyze (default: cooking)
  -f, --file <path>     Path to Character JSON (default: auto-detect in cwd)
  -r, --refresh         Force re-scrape of wiki data
      --recipes         Print recipe names per tier
  -h, --help            Show this help`);
}

function formatTier(tier: TierBucket, showRecipes: boolean): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`━━━ ${tier.label} ━━━ (${tier.recipes.length} recipes)`);
  if (tier.recipes.length === 0) {
    lines.push('  (nothing to make)');
    return lines.join('\n');
  }
  if (showRecipes) {
    lines.push('Recipes:');
    for (const r of tier.recipes) {
      const ing = r.ingredients.map((i) => `${i.name} x${i.qty}`).join(', ');
      lines.push(`  • [${r.level}] ${r.name} — ${ing}`);
    }
    lines.push('');
  }
  lines.push('Grocery:');
  const maxNameLen = Math.max(...tier.grocery.map((g) => g.ingredient.length));
  for (const g of tier.grocery) {
    lines.push(`  ${g.ingredient.padEnd(maxNameLen)}  x${g.qty}`);
  }
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = getSkill(args.skill);

  const charFile = args.characterFile ?? (await findCharacterFile('.'));
  if (!charFile) {
    console.error('No Character_*.json found in cwd. Pass --file <path>.');
    process.exit(1);
  }

  const character = await loadCharacter(charFile);
  const recipes = await getRecipes(args.skill, cfg.url, args.refresh);

  const tiers = buildGroceryByTier(recipes, character);

  const totalRecipes = tiers.reduce((s, t) => s + t.recipes.length, 0);
  console.log(`Character: ${character.Character} (${character.ServerName})`);
  console.log(`Skill: ${cfg.skill}  |  Wiki recipes: ${recipes.length}`);
  console.log(`Incomplete & matched: ${totalRecipes} recipes`);

  for (const tier of tiers) {
    console.log(formatTier(tier, args.showRecipes));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
