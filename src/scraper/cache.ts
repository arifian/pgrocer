import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Recipe } from '../types.js';
import { scrapeRecipes } from './wiki.js';

const CACHE_DIR = path.resolve('data', 'cache');

function cachePath(skill: string): string {
  return path.join(CACHE_DIR, `${skill.toLowerCase()}.json`);
}

export async function loadCached(skill: string): Promise<Recipe[] | null> {
  try {
    const raw = await fs.readFile(cachePath(skill), 'utf8');
    return JSON.parse(raw) as Recipe[];
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function saveCache(skill: string, recipes: Recipe[]): Promise<string> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const file = cachePath(skill);
  await fs.writeFile(file, JSON.stringify(recipes, null, 2), 'utf8');
  return file;
}

export async function getRecipes(skill: string, url: string, forceRefresh = false): Promise<Recipe[]> {
  if (!forceRefresh) {
    const cached = await loadCached(skill);
    if (cached) return cached;
  }
  const fresh = await scrapeRecipes(url);
  await saveCache(skill, fresh);
  return fresh;
}
