import { getSkill } from '../skills.js';
import { getRecipes, saveCache } from '../scraper/cache.js';
import { scrapeRecipes } from '../scraper/wiki.js';

async function main() {
  const skillArg = process.argv[2] ?? 'cooking';
  const cfg = getSkill(skillArg);
  console.log(`Scraping ${cfg.skill} recipes from ${cfg.url}`);
  const recipes = await scrapeRecipes(cfg.url);
  const file = await saveCache(skillArg, recipes);
  console.log(`Saved ${recipes.length} recipes → ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
