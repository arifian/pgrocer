import * as cheerio from 'cheerio';
import type { Ingredient, Recipe } from '../types.js';

function parseItemCell(html: string): Ingredient[] {
  const parts = html.split(/<br\s*\/?>/i);
  const out: Ingredient[] = [];
  for (const part of parts) {
    const $ = cheerio.load(`<div>${part}</div>`);
    const anchor = $('a')
      .filter((_, a) => {
        const href = $(a).attr('href') ?? '';
        return href.startsWith('/wiki/') && !href.includes('/File:');
      })
      .first();
    if (!anchor.length) continue;
    const name = anchor.text().trim();
    if (!name) continue;
    const text = $('div').text();
    const match = text.match(/x(\d+)/);
    const qty = match ? parseInt(match[1], 10) : 1;
    out.push({ name, qty });
  }
  return out;
}

function extractSource(html: string): string {
  const $ = cheerio.load(`<div>${html}</div>`);
  return $('div').text().replace(/\s+/g, ' ').trim();
}

export async function scrapeRecipes(url: string): Promise<Recipe[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'pgrocer/0.1 (personal use)' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const table = $('table.sortable').first();
  if (!table.length) {
    throw new Error('Recipe table not found on page');
  }

  const recipes: Recipe[] = [];
  table.find('tr').each((_, tr) => {
    const cells = $(tr).find('td');
    if (cells.length < 6) return;

    const levelText = $(cells[0]).text().trim();
    const level = parseInt(levelText, 10);
    if (Number.isNaN(level)) return;

    const name = $(cells[1]).text().trim();
    if (!name) return;

    const ingredients = parseItemCell($(cells[4]).html() ?? '');
    const results = parseItemCell($(cells[5]).html() ?? '');
    const source = cells.length >= 8 ? extractSource($(cells[7]).html() ?? '') : undefined;

    recipes.push({ name, level, ingredients, results, source });
  });

  return recipes;
}
