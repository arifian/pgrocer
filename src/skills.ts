import type { SkillConfig } from './types.js';

export const SKILLS: Record<string, SkillConfig> = {
    cooking: {
        skill: 'Cooking',
        url: 'https://wiki.projectgorgon.com/wiki/Cooking/Recipes',
    },
    alchemy: {
        skill: 'Alchemy',
        url: 'https://wiki.projectgorgon.com/wiki/Alchemy/Recipes'
    },
};

export function getSkill(name: string): SkillConfig {
  const key = name.toLowerCase();
  const cfg = SKILLS[key];
  if (!cfg) {
    throw new Error(`Unknown skill "${name}". Known: ${Object.keys(SKILLS).join(', ')}`);
  }
  return cfg;
}

export function normalizeName(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}
