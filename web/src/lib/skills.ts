export interface SkillMeta {
  key: string;
  label: string;
}

export const WEB_SKILLS: SkillMeta[] = [
  { key: 'cooking', label: 'Cooking' },
  { key: 'alchemy', label: 'Alchemy' },
];

export async function loadRecipes(skill: string): Promise<unknown[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${skill}.json`);
  if (!res.ok) throw new Error(`Failed to load ${skill} recipes: ${res.status}`);
  return res.json();
}
