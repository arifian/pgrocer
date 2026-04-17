import type { CharacterReport } from './types.js';

export function parseCharacter(raw: string): CharacterReport {
  const data = JSON.parse(raw) as CharacterReport;
  if (!data || typeof data !== 'object' || !data.RecipeCompletions) {
    throw new Error('Invalid character JSON: missing RecipeCompletions');
  }
  return data;
}
