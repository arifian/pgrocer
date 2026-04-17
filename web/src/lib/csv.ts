import type { GroceryEntry, TierBucket } from '@core/types.js';

function escape(field: string | number): string {
  const s = String(field);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function tierGroceryCsv(tier: TierBucket): string {
  const header = ['ingredient', 'qty', 'from_recipes'];
  const rows = tier.grocery.map((g) => [g.ingredient, g.qty, g.fromRecipes.join('; ')]);
  return [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export function allTiersCsv(tiers: TierBucket[]): string {
  const header = ['tier', 'ingredient', 'qty', 'from_recipes'];
  const rows: (string | number)[][] = [];
  for (const t of tiers) {
    for (const g of t.grocery) {
      rows.push([t.label, g.ingredient, g.qty, g.fromRecipes.join('; ')]);
    }
  }
  return [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
}

export function download(filename: string, content: string, mime = 'text/csv'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type { GroceryEntry };
