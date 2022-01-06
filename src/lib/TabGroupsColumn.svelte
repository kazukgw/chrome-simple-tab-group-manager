<script lang="ts">
  import ColorCode from './ColorCode.ts'
  import { TabInfo, TabGroupInfo, TabGroups } from './TabGroupInfo.ts'

  const tabgroups = new TabGroups();

  let actives: TabGroupInfo[] = [];
  let inactives: TabGroupInfo[] = [];

  async function reset() {
    const a = await tabgroups.getActives();
    actives = Object.values(a);
    const i = await tabgroups.getInactives()
    inactives = Object.values(i);
  }

  function deactivate(ev) {
    const tgid = ev.currentTarget.id;
    tabgroups.deactivateTabGroup(tgid).then(()=>{
      reset();
    })
  }

  function activate(ev) {
    const tgid = ev.currentTarget.id;
    tabgroups.activateTabGroup(tgid).then(()=>{
      reset();
    });
  }

  function remove(ev) {
    const tgid = ev.currentTarget.dataset.tgid;
    tabgroups.removeInactiveTabGroup(tgid).then(()=>{
      reset();
    });
  }

  reset();
</script>

<div>
  <div class="tglist">
    {#each actives as tg}
      <div class="tab-group-container">
        <div id="{tg.id}" class="tab-group" on:click={deactivate}>
          <div class="circle color-{tg.color}"></div>
          <div class="tab-group-title">{tg.title}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="tglist">
    {#each inactives as tg}
      <div class="tab-group-container">
        <div id="{tg.id}" class="tab-group dark" on:click={activate}>
          <div class="circle color-{tg.color}"></div>
          <div class="tab-group-title">{tg.title}</div>
        </div>
        <div data-tgid="{tg.id}" class="icon-box close-button" on:click={remove}><span class="icon-close"></span></div>
      </div>
    {/each}
  </div>

</div>

<style lang="scss">

.color-grey   { background-color: #bec1c5 }
.color-blue   { background-color: #94b3f2 }
.color-red    { background-color: #e38f86 }
.color-yellow { background-color: #f6d675 }
.color-green  { background-color: #92c699 }
.color-pink   { background-color: #ee92c8 }
.color-purple { background-color: #cfb1f6 }
.color-cyan   { background-color: #92d8e9 }

.tglist {
  margin: 8px 0;
  padding: 3px;
}

.box {
  width: 100%;
  margin: 0 auto;
}

.dark {
  color: #ffffff;
  background-color: #efefef;
}

.tab-group-container {
  margin: 3px 0;
  height: 32px;
}

.tab-group {
  color: #383838;
  border: 1px solid;
  border-color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-family: "Lato","Helvetica Neue","Helvetica",Helvetica,Arial,sans-serif;
  line-height: inherit;
  padding: 6px 3px;
  margin: 3px;
  height: 14px;
  line-height: 14px;
  text-overflow: ellipsis;
  display: inline-block;
}

.tab-group:hover {
  border: 1px solid;
  border-color: #c9c9c9;
}

.circle {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  vertical-align: middle;
  margin: 0 5px;
}

.tab-group-title {
  width: 150px;
  display: inline-block;
  vertical-align: middle;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.icon-box {
  font-size: 16px;
  display: inline-block;
  color: #b0b0b0;
  cursor: pointer;
  vertical-align: middle;
  padding: 0;
  margin: 0;
}

.icon-box:hover {
  color: #ff4040;
}

#clear-btn {
  color: #b0b0b0;
  border: 0 none;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  padding: 6px 6px;
  text-align: center;
  margin: 6px auto;
}

#clear-btn:hover {
  color: #ff4040;
}
</style>
