<script lang="ts">
  import ColorCode from './ColorCode.ts'
  import { TabInfo, TabGroupInfo, TabGroups } from './TabGroupInfo.ts'

  const tabgroups = new TabGroups();

  let actives: TabGroupInfo[] = [];
  let inactives: TabGroupInfo[] = [];
  let filteredActives: TabGroupInfo[] = [];
  let filteredInactives: TabGroupInfo[] = [];
  let filteredAll: TabGroupInfo[] = [];

  let filterValue = "";

  let selectedIndex = null;
  let selectedTabGroupInfoId = null;

  function sortfn(l: TabGroupInfo, r: TabGroupInfo) {
    return (r.savedAt || 0) - (l.savedAt || 0);
  }

  function filtering() {
    selectedIndex = null;
    selectedTabGroupInfoId = null;
    filteredActives = actives.filter((tginfo)=> { return tginfo.title.includes(filterValue) })
    filteredInactives = inactives.filter((tginfo)=> { return tginfo.title.includes(filterValue) })
    filteredAll = filteredActives.concat(filteredInactives);
  }

  function handleKeydown(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      changeSelected(e);
    }
    if (e.key === "Enter") {
      updateTabGroupStatus();
    }
  }

  function changeSelected(e) {
    if(e.key === "ArrowUp") {
      if(selectedIndex == null) {
        selectedIndex = filteredAll.length - 1;
      } else if(selectedIndex < 1) {
        selectedIndex = 0;
      }
      else {
        selectedIndex = selectedIndex - 1;
      }
    } else if(e.key === "ArrowDown") {
      if(selectedIndex == null) {
        selectedIndex = 0
      } else if(selectedIndex >= filteredAll.length - 1) {
        selectedIndex = filteredAll.length - 1;
      } else {
        selectedIndex = selectedIndex + 1;
      }
    }
    selectedTabGroupInfoId = filteredAll[selectedIndex].id;
  }

  async function reset() {
    const a = await tabgroups.getActives();
    actives = Object.values(a).sort(sortfn);
    const i = await tabgroups.getInactives()
    inactives = Object.values(i).sort(sortfn);
    filtering()
  }

  function updateTabGroupStatus() {
    const selectedTabGroup = filteredAll[selectedIndex];
    if(selectedTabGroup == null) {
      return;
    }
    if(selectedTabGroup.savedAt == null) {
      tabgroups.deactivateTabGroup(selectedTabGroup.id + "").then(()=>{
        reset();
      });
    } else {
      tabgroups.activateTabGroup(selectedTabGroup.id + "").then(()=>{
        reset();
      });
    }
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

<svelte:window on:keydown={handleKeydown}/>

<div class="filter">
  <input autofocus type="text" bind:value={filterValue} on:input={filtering}>
</div>

<div>
  <div class="tglist">
    {#each filteredActives as tg}
      <div class="tab-group-container">
        <div id="{tg.id}" class="tab-group {selectedTabGroupInfoId === tg.id ? 'selected': ''}" on:click={deactivate}>
          <div class="circle color-{tg.color}"></div>
          <div class="tab-group-title">{tg.title}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="tglist">
    {#each filteredInactives as tg}
      <div class="tab-group-container">
        <div id="{tg.id}" class="tab-group {selectedTabGroupInfoId === tg.id ? 'selected': ''} dark" on:click={activate}>
          <div class="circle color-{tg.color}"></div>
          <div class="tab-group-title">{tg.title}</div>
        </div>
        <div data-tgid="{tg.id}" class="icon-box close-button" on:click={remove}><span class="icon-close"></span></div>
      </div>
    {/each}
  </div>

</div>

<style lang="scss">

.filter {
  input[type="text"]:focus {
    outline: none;
  }
  input[type="text"] {
    width: 100%;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid gray;
  }
}

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

.tab-group.selected {
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
  width: 200px;
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
