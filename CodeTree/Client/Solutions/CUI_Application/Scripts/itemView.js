window.aras = new Aras(top.aras);
window.store = top.store;

var paramObjectName = window.name + "_params";
window.opener = window.opener || window.parent;

const urlParams = new URLSearchParams(window.location.search);
window.itemId = urlParams.get("itemId") || opener[paramObjectName].itemId;

window.opener[paramObjectName] = null;
