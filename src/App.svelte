<script lang="ts">
  import TabGroupsColumn from './lib/TabGroupsColumn.svelte'
  import TabGroupsPage from './lib/TabGroupsPage.svelte'

  const url = new URL(window.location);
  const mode = url.searchParams.get("mode");

  function createPagesTab() {
    chrome.tabs.create({
      url: "index.html?mode=page",
      active: true,
    });
  }
</script>

<main>
  <div id="title">
  {#if mode === "page"}
    <h1 class="h1large">Simple Tab Group Manager</h1>
  {:else}
    <h1 on:click={createPagesTab}>Simple Tab Group Manager</h1>
  {/if}
  </div>
  {#if mode === "page"}
    <TabGroupsPage />
  {:else}
    <TabGroupsColumn />
  {/if}
</main>

<style lang="scss">

:global(body){
  margin: 0;
  padding: 0;
  font-family: "Lato","Helvetica Neue","Helvetica",Helvetica,Arial,sans-serif;
}

:global(div) {
  padding: 0;
  margin: 0;
}

#title {
  color: white;
  background-color: #f00048;
  padding: 2px;
  cursor: pointer;

  h1 {
    text-align: center;
    font-size: 12px;
  }

  h1.h1large {
    text-align: center;
    font-size: 20px;
  }
}

</style>
