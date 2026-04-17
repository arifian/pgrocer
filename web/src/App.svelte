<script lang="ts">
  import { parseCharacter } from '@core/character.js';
  import { buildGroceryByTier } from '@core/grocery.js';
  import type { CharacterReport, Recipe, TierBucket } from '@core/types.js';
  import { WEB_SKILLS, loadRecipes } from './lib/skills.js';
  import { allTiersCsv, tierGroceryCsv, download } from './lib/csv.js';
  import GroceryTable from './lib/GroceryTable.svelte';

  let skill = $state('cooking');
  let character = $state<CharacterReport | null>(null);
  let fileName = $state<string | null>(null);
  let tiers = $state<TierBucket[]>([]);
  let status = $state<string | null>(null);
  let error = $state<string | null>(null);
  let busy = $state(false);
  let dragActive = $state(false);

  const totalRecipes = $derived(tiers.reduce((s, t) => s + t.recipes.length, 0));
  const hasResult = $derived(tiers.length > 0);

  async function readFile(file: File) {
    error = null;
    try {
      const text = await file.text();
      character = parseCharacter(text);
      fileName = file.name;
      status = `Loaded ${character.Character} (${character.ServerName})`;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      character = null;
      fileName = null;
    }
  }

  function onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) readFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) readFile(file);
  }

  async function generate() {
    if (!character) {
      error = 'Drop a character JSON first.';
      return;
    }
    busy = true;
    error = null;
    try {
      const recipes = (await loadRecipes(skill)) as Recipe[];
      tiers = buildGroceryByTier(recipes, character);
      status = `Generated ${skill} grocery list from ${recipes.length} recipes.`;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      tiers = [];
    } finally {
      busy = false;
    }
  }

  function downloadAll() {
    if (!hasResult) return;
    const name = character?.Character ?? 'character';
    download(`pgrocer-${name}-${skill}.csv`, allTiersCsv(tiers));
  }

  function downloadTier(tier: TierBucket) {
    const name = character?.Character ?? 'character';
    const label = tier.label.replace(/\s+/g, '_');
    download(`pgrocer-${name}-${skill}-${label}.csv`, tierGroceryCsv(tier));
  }
</script>

<header class="container">
  <nav>
    <ul>
      <li><strong>pgrocer</strong></li>
    </ul>
    <ul>
      <li><a href="https://wiki.projectgorgon.com/" target="_blank" rel="noreferrer noopener">Wiki</a></li>
      <li><a href="https://forms.gle/YS3ikymhSaWCPoms8" target="_blank" rel="noreferrer noopener">Feedback</a></li>
    </ul>
  </nav>
</header>

<main class="container">
  <hgroup>
    <h1>Project Gorgon grocery list</h1>
    <p>Drop your character JSON, pick a skill, get an aggregated ingredient list for recipes you haven't made yet. Runs entirely in your browser — your character file never leaves your device.</p>
  </hgroup>

  <section>
    <div
      class="drop-zone"
      class:active={dragActive}
      role="region"
      aria-label="Character JSON drop zone"
      ondragover={(e) => {
        e.preventDefault();
        dragActive = true;
      }}
      ondragleave={() => (dragActive = false)}
      ondrop={onDrop}
    >
      {#if fileName}
        <p><strong>{fileName}</strong> loaded. Drop another file to replace.</p>
      {:else}
        <p>Drop <code>Character_*.json</code> here</p>
      {/if}
      <input type="file" accept=".json,application/json" onchange={onFileInput} />
    </div>
  </section>

  <section class="toolbar">
    <label>
      Skill
      <select bind:value={skill}>
        {#each WEB_SKILLS as s (s.key)}
          <option value={s.key}>{s.label}</option>
        {/each}
      </select>
    </label>
    <button onclick={generate} disabled={!character || busy} aria-busy={busy}>
      {busy ? 'Generating…' : 'Generate'}
    </button>
    {#if hasResult}
      <button class="secondary" onclick={downloadAll}>Download CSV (all tiers)</button>
    {/if}
  </section>

  {#if error}
    <article><mark>Error:</mark> {error}</article>
  {:else if status}
    <p class="muted">{status}</p>
  {/if}

  {#if hasResult}
    <p><strong>{totalRecipes}</strong> incomplete recipes across {tiers.length} tiers.</p>
    {#each tiers as tier (tier.label)}
      {#if tier.recipes.length > 0}
        <section class="tier">
          <div class="toolbar">
            <h3>{tier.label}</h3>
            <span class="muted">{tier.recipes.length} recipes · {tier.grocery.length} ingredients</span>
            <button class="secondary outline" onclick={() => downloadTier(tier)}>CSV</button>
          </div>
          <GroceryTable rows={tier.grocery} />
        </section>
      {/if}
    {/each}
  {/if}
</main>

<footer class="container">
  <p>
    Recipe data © <a href="https://www.eldergame.com/" target="_blank" rel="noreferrer noopener">Elder Game, LLC</a>.
    pgrocer is an unofficial community tool. <a href="https://github.com/" target="_blank" rel="noreferrer noopener">Source</a>.
  </p>
</footer>
