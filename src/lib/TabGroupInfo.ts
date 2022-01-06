export interface TabInfo {
  id: number;
  url: string;
  favIconUrl: string;
  title: string;
}

export interface TabGroupInfo extends chrome.tabGroups.TabGroup {
  tabs: TabInfo[];
}

export class TabGroups {
  async getInactives(): Promise<{ [key: string]: TabGroupInfo }> {
    let inactives: { [key: string]: any } = await chrome.storage.local.get(null);
    inactives = inactives as { [key: string]: TabGroupInfo };
    if (inactives == null) {
      return {};
    }
    return inactives;
  }

  async getActives(): Promise<{ [key: string]: TabGroupInfo }> {
    const tabgroups = (await chrome.tabGroups.query({})) as TabGroupInfo[];
    return tabgroups.reduce((prev, cur) => {
      prev[cur.id] = cur;
      return prev;
    }, {});
  }

  async deactivateTabGroup(tgid: string): Promise<void> {
    const tginfos = await this.getActives();
    const tginfo = tginfos[tgid];
    if (tginfo == null) {
      throw new Error("specified tab group not found");
    }

    const tabs = await chrome.tabs.query({});
    tginfo.tabs = tabs
      .filter((t) => {
        return tginfo.id === t.groupId;
      })
      .map((t): TabInfo => {
        let _url = t.url;
        if (/^chrome/.test(t.url)) {
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

    await chrome.storage.local.set({ [tgid]: tginfo });

    await chrome.tabs.remove(tginfo.tabs.map((t) => t.id));
  }

  async removeInactiveTabGroup(tgid: string): Promise<void> {
    return chrome.storage.local.remove(tgid);
  }

  async activateTabGroup(tgid: string) {
    const inactives = await this.getInactives();
    const tginfo = inactives[tgid];
    if (tginfo == null) {
      throw new Error("specifind tab group not found");
    }
    const tabs = await Promise.all(
      tginfo.tabs.map(async (tabinfo) => {
        const b64info = window.btoa(
          encodeURIComponent(JSON.stringify(tabinfo))
        );
        return await chrome.tabs.create({
          url: "redirect.html?info=" + b64info,
          active: false,
        });
      })
    );
    const newTgid = await chrome.tabs.group({ tabIds: tabs.map((t) => t.id) });
    await chrome.tabGroups.update(newTgid, {
      title: tginfo.title,
      color: tginfo.color,
      collapsed: true,
    });
    await chrome.storage.local.remove(tgid);
  }
}
