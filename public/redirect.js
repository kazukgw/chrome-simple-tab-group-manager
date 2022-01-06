const url = new URL(window.location.href);
const params = url.searchParams;
const b64info = params.get("info");
const tabinfo = JSON.parse(decodeURIComponent(window.atob(b64info)));

document.title = tabinfo.title;

const headTitle = document.querySelector("head");
const setFavicon = document.createElement("link");
setFavicon.setAttribute("rel", "shortcut icon");
setFavicon.setAttribute("href", tabinfo.favIconUrl);
headTitle.appendChild(setFavicon);

document.querySelector("body").style = `
background-image: url(${tabinfo.favIconUrl});
background-repeat: no-repeat;
background-position: center;`;

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === 'visible') {
    window.location.href = tabinfo.url;
  }
});
