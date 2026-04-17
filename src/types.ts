export interface Ingredient {
  name: string;
  qty: number;
}

export interface Recipe {
  name: string;
  level: number;
  ingredients: Ingredient[];
  results: Ingredient[];
  source?: string;
}

export interface SkillConfig {
  skill: string;
  url: string;
}

export interface CharacterReport {
  Character: string;
  ServerName: string;
  Skills: Record<string, { Level: number }>;
  RecipeCompletions: Record<string, number>;
}

export interface GroceryEntry {
  ingredient: string;
  qty: number;
  fromRecipes: string[];
}

export interface TierBucket {
  label: string;
  minLevel: number;
  maxLevel: number;
  recipes: Recipe[];
  grocery: GroceryEntry[];
}
