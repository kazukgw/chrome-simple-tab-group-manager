<script lang="ts">
  import TabGroupsColumn from './lib/TabGroupsColumn.svelte'
</script>

<main>
  <div id="title">
    <h1>Simple Tab Group Manager</h1>
  </div>
  <TabGroupsColumn />
</main>

<style lang="scss">

:global(body){
  width: 270px;
  margin: 0;
  padding: 0;
  border-radius: 3px 3px 3px 3px;
  border-color: gray;
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

  h1 {
    text-align: center;
    font-size: 12px;
  }
}

</style>
