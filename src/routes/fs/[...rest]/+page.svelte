<script lang="ts">
import type { PageData } from './$types';

export let data: PageData;
$: root_path = data.path.split('/').filter(Boolean);
</script>

<div class="container py-12 font-mono">
  <div>
    path: {#each root_path as tok, i}
      <a
        href="/{root_path.slice(0, i + 1).join('/')}"
        class="[&::before]:[content:'/_'] hover:text-primary"
      >
        {tok}
      </a>
    {/each}
  </div>
  {#if data.type === 'directory'}
    <div class="mt-4">
      {#each data.data as nx (nx.link)}
        <div>
          <span>{nx.type == 'file' ? 'f' : nx.type === 'directory' ? 'd' : '-'}</span>
          <a href="{nx.link}" class="hover:text-primary">
            {nx.name}
          </a>
        </div>
      {:else}
        <div>EMPTY DIRECTORY</div>
      {/each}
    </div>
  {/if}
</div>
