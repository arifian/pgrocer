# pgrocer

Project Gorgon grocery list generator. Reads a character JSON export, cross-references recipes from the wiki, and prints a grocery list for recipes you have not yet completed (completion count `0`), grouped by skill-level tiers of 10.

Currently supports **Cooking**. Architecture is skill-agnostic — adding more skills is a one-line registry entry.

## Stack

- Node 22+ / TypeScript (ESM)
- `cheerio` for HTML parsing
- `tsx` for direct TS execution
- Static-deploy friendly (future web UI via Astro)

## Install

```bash
npm install
```

## Usage

### 1. Scrape recipes (first run or to refresh)

```bash
npm run scrape                 # scrapes cooking by default
npm run scrape -- <skill>      # e.g. npm run scrape -- cooking
```

Output is cached at `data/cache/<skill>.json`. Subsequent `grocer` runs use the cache unless `--refresh` is passed.

### 2. Build grocery list

```bash
npm run grocer
```

Options:

| Flag | Description |
|------|-------------|
| `-s, --skill <name>` | Skill to analyze. Default: `cooking`. |
| `-f, --file <path>` | Path to Character JSON. Default: auto-detect `Character_*.json` in cwd. |
| `-r, --refresh` | Force re-scrape of wiki data before building the list. |
| `--recipes` | Also print each incomplete recipe per tier. |
| `-h, --help` | Show help. |

Examples:

```bash
npm run grocer -- --recipes
npm run grocer -- --file characters/kambiing.json
npm run grocer -- --skill cooking --refresh
```

## Character JSON source

The input JSON is a character export from Project Gorgon. `pgrocer` sources it in this priority:

1. Explicit path via `--file <path>`.
2. Auto-detect: scans the current working directory for the first file matching `Character_*.json`.

If you regularly switch between characters, keep them in a `characters/` folder and always pass `--file` to avoid ambiguity.

## How matching works

- Wiki recipe names (e.g., `Baked Potato`) and JSON completion keys (e.g., `BakedPotato`) are normalized by stripping all non-alphanumeric characters and lowercasing.
- Only recipes that **exist on the wiki** AND have completion `0` in the character JSON are included. Recipes absent from the wiki scrape are dropped.
- Ingredient quantities per tier are summed across all incomplete recipes in that tier.

## Output format

```
Character: <name> (<server>)
Skill: Cooking  |  Wiki recipes: <count>
Incomplete & matched: <count> recipes

━━━ Lvl 0-9 ━━━ (N recipes)
Grocery:
  Salt     x14
  Flour    x8
  ...
```

With `--recipes`, each tier also lists the recipes being targeted.

## Adding a new skill

Edit `src/skills.ts`:

```ts
export const SKILLS: Record<string, SkillConfig> = {
  cooking: { skill: 'Cooking', url: 'https://wiki.projectgorgon.com/wiki/Cooking/Recipes' },
  alchemy: { skill: 'Alchemy', url: 'https://wiki.projectgorgon.com/wiki/Alchemy/Recipes' },
};
```

The scraper targets MediaWiki `table.sortable` with columns `Lvl | Name | First-Time XP | XP | Ingredients | Results | Description | Source`. Any skill recipe page with this structure will work unchanged.

## Project layout

```
src/
  types.ts              shared types
  skills.ts             skill registry + name normalization
  character.ts          load character JSON / auto-detect
  grocery.ts            filter + tier grouping + ingredient aggregation
  scraper/
    wiki.ts             MediaWiki table parser
    cache.ts            load/save scraped JSON
  cli/
    scrape.ts           CLI: scrape & cache
    grocer.ts           CLI: build grocery list

data/cache/             scraped wiki data (generated)
```

## Roadmap

- Web app (Astro static export): upload character JSON client-side, render tiers, no backend.
- Support more skills via registry extension.
- Ingredient source annotations (which NPC / zone).
