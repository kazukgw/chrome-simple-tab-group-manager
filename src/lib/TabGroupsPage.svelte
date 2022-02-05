<script lang="ts">
  import { TabInfo, TabGroupInfo, TabGroups } from './TabGroupInfo.ts'

  const tabgroups = new TabGroups();

  let actives: TabGroupInfo[] = [];
  let inactives: TabGroupInfo[] = [];
  let copyAsMarkdownMessage: string = "";
  let copyInactivesAsJSONMessage: string = "";
  let importJSONFromClipboardMessage: string = "";

  function sortfn(l: TabGroupInfo, r: TabGroupInfo) {
    return (r.savedAt || 0) - (l.savedAt || 0);
  }

  async function reset() {
    const activeTabGroups = Object.values(await tabgroups.getActives()).sort(sortfn);
    const activeTabs = await chrome.tabs.query({});
    activeTabGroups.forEach((tginfo)=>{
      tginfo.tabs = activeTabs
        .filter((t) => {
          return tginfo.id === t.groupId;
        })
        .map((t): TabInfo => {
          let _url = t.url;
          const ptn = new RegExp(`^chrome-extension:\/\/${chrome.runtime.id}`);
          if (ptn.test(t.url)) {
            const url = new URL(t.url);
            const params = url.searchParams;
            const b64info = params.get("info");
            const tabinfo = JSON.parse(decodeURIComponent(window.atob(b64info)));
            _url = tabinfo.url;
          }
          return {
            id: t.id,
            url: _url,
            favIconUrl: t.favIconUrl,
            title: t.title,
          };
        });
    });
    actives = activeTabGroups;

    inactives = Object.values(await tabgroups.getInactives()).sort(sortfn);
  }

  function copyAsMarkdown() {
    let text="";
    text += "# Actives\n"
    actives.forEach((tg)=>{
      text += `\n## ${tg.title}\n\n`;
      tg.tabs.forEach((tab)=>{
        text += `- [${tab.title}](${tab.url})\n`;
      });
    });
    text += "\n\n"
    text += "# Inactives\n"
    inactives.forEach((tg)=>{
      text += `\n## ${tg.title}\n\n`;
      tg.tabs.forEach((tab)=>{
        text += `- [${tab.title}](${tab.url})\n`;
      });
    });
    text += "\n"
    window.navigator.clipboard.writeText(text).then(()=>{
      copyAsMarkdownMessage = "... copied!"
    });
  }

  function copyInactivesAsJSON() {
    window.navigator.clipboard.writeText(JSON.stringify(inactives)).then(()=>{
      copyInactivesAsJSONMessage = "... copied!"
    });
  }

  function importJSONFromClipboard() {
    if(!window.confirm("クリップボードからタブグループをインポートします")) {
      return;
    }
    setTimeout(()=>{
      window.navigator.clipboard.readText().then((text)=>{
        try {
          const inactives = JSON.parse(text);
          const inactivesObj = inactives.reduce((prev, cur)=>{
            prev[cur.id] = cur;
            return prev;
          }, {});
          chrome.storage.local.set(inactivesObj).then(()=>{
            importJSONFromClipboardMessage = "... imported!";
          });
        } catch(e) {
          alert(e);
        }
      });
    }, 1000);
  }

  reset()
</script>

<div id="tabgroupspage">
  <div>
    <p on:click={copyAsMarkdown} class="action-button"> Copy as markdown {copyAsMarkdownMessage} </p>
    <p on:click={copyInactivesAsJSON} class="action-button"> Copy inactives as JSON {copyInactivesAsJSONMessage} </p>
    <p on:click={importJSONFromClipboard} class="action-button"> Import JSON from clipboard {importJSONFromClipboardMessage} </p>
  </div>
  <div class="tglist">
    <h1> Actives </h1>
    {#each actives as tg}
      <div class="tab-group-container">
        <div>
          <div class="circle color-{tg.color}"></div>
          <div class="tg-title"> {tg.title}</div>
        </div>
          {#each tg.tabs as tab}
            <div class="tab-link">
              <a href="{tab.url}" target="_blank">
              <img class="link-icon" src="{tab.favIconUrl}"> <span class="tab-title"> {tab.title} </span> </a>
            </div>
          {/each}
      </div>
    {/each}
  </div>

  <div class="tglist dark">
    <h1 class="dark"> Inactives </h1>
    {#each inactives as tg}
      <div class="tab-group-container">
        <div>
          <div class="circle color-{tg.color}"></div>
          <div class="tg-title"> {tg.title}</div>
        </div>

        {#each tg.tabs as tab}
          <div class="tab-link">
            <a href="{tab.url}" target="_blank">
            <img class="link-icon" src="{tab.favIconUrl}"> <span class="tab-title"> {tab.title} </span> </a>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
:global(body){
  width: 100%;
}

#tabgroupspage {
  margin-left: auto;
  margin-right: auto;
  width: 680px;
}

.circle {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  vertical-align: middle;
  margin: 0 5px;
}


h1 {
  color: #383838;
  text-decoration: underline;
}

.tg-title {
  display: inline-block;
  color: #383838;
  font-size: 22px;
  font-weight: bold;
  margin: 0 5px 14px 0;
  vertical-align: sub;
}

.tab-group-container {
  margin-bottom: 18px;
}

img.link-icon {
  height: 16px;
}

.tglist {
  margin-bottom: 25px;
  padding: 2px 10px 15px 10px;
  border-radius: 5px;
}

.tglist.dark {
  background-color: #eeeeee;
}

.tab-link {
  margin: 0 0 5px 16px;

  a {
    color: #2c4ef5;
    text-decoration: none;
  }

  .tab-title{
    vertical-align: super;
  }
}

.action-button {
  cursor: pointer;
  font-size: 15px;
  margin: 10px;
  text-decoration: underline;
}

.color-grey   { background-color: #bec1c5 }
.color-blue   { background-color: #94b3f2 }
.color-red    { background-color: #e38f86 }
.color-yellow { background-color: #f6d675 }
.color-green  { background-color: #92c699 }
.color-pink   { background-color: #ee92c8 }
.color-purple { background-color: #cfb1f6 }
.color-cyan   { background-color: #92d8e9 }
.color-orange { background-color: #efaf7a }


</style>
