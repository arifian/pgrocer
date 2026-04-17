import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CharacterReport } from './types.js';

export async function loadCharacter(file: string): Promise<CharacterReport> {
  const abs = path.resolve(file);
  const raw = await fs.readFile(abs, 'utf8');
  return JSON.parse(raw) as CharacterReport;
}

export async function findCharacterFile(dir = '.'): Promise<string | null> {
  const entries = await fs.readdir(dir);
  const match = entries.find((e) => /^Character_.*\.json$/.test(e));
  return match ? path.join(dir, match) : null;
}
