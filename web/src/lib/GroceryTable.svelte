<script lang="ts">
  import type { GroceryEntry } from '@core/types.js';

  interface Props {
    rows: GroceryEntry[];
  }
  let { rows }: Props = $props();

  type SortKey = 'ingredient' | 'qty' | 'fromRecipes';
  let sortKey = $state<SortKey>('qty');
  let sortDir = $state<'asc' | 'desc'>('desc');

  const sorted = $derived.by(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'qty') cmp = a.qty - b.qty;
      else if (sortKey === 'ingredient') cmp = a.ingredient.localeCompare(b.ingredient);
      else cmp = a.fromRecipes.length - b.fromRecipes.length;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  });

  function toggle(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = key === 'qty' ? 'desc' : 'asc';
    }
  }

  function ariaSort(key: SortKey): 'ascending' | 'descending' | undefined {
    if (sortKey !== key) return undefined;
    return sortDir === 'asc' ? 'ascending' : 'descending';
  }
</script>

<table class="sortable striped">
  <thead>
    <tr>
      <th aria-sort={ariaSort('ingredient')} onclick={() => toggle('ingredient')}>Ingredient</th>
      <th aria-sort={ariaSort('qty')} onclick={() => toggle('qty')}>Qty</th>
      <th aria-sort={ariaSort('fromRecipes')} onclick={() => toggle('fromRecipes')}>Recipes</th>
    </tr>
  </thead>
  <tbody>
    {#each sorted as row (row.ingredient)}
      <tr>
        <td>{row.ingredient}</td>
        <td>{row.qty}</td>
        <td class="muted">{row.fromRecipes.join(', ')}</td>
      </tr>
    {/each}
  </tbody>
</table>
