// CodeTree/Client/Solutions/CUI_Application/Scripts/sidebar.ts
var CUIAPPItemTypeID = "772CE3BCA6B54634AF93EB25828EC350";
var CUIAPPItemType = "CUI_Application";
var defaultIcon = "../Solutions/CUI_Application/images/default_icon.svg";
var itemTemplate = (item) => `
  <div class="cui-app-sidebar-item" data-id="${item.id}">
    <img src="${item.icon || defaultIcon}" />
    <div class="cui-app-sidebar-item-text">
      <h4>${item.isFavorite ? "<span />" : ""} ${item.name}</h4>
      <p>${item.description}</p>
    </div>
    <div class="cui_app-sidebar-item-arrow"></div>
  </div>`;

class CUIAppMainSidebar {
  isAdmin;
  favorites = new Set;
  items = [];
  sidebar = document.createElement("div");
  header = document.createElement("div");
  content = document.createElement("div");
  adminBtn;
  headerBtn;
  constructor() {
    this.isAdmin = aras.isAdminUser();
    this.setupSidebar();
    this.fetchItems().then(() => this.refreshItems());
  }
  toggleSidebar(force) {
    this.sidebar.toggleAttribute("expanded", force);
  }
  async refreshItems(fetch = false) {
    if (fetch)
      await this.fetchItems();
    this.getFavorites();
    this.updateSidebarItems();
  }
  openAdminSearch() {
    this.toggleSidebar(false);
    const currentTab = arasTabs.tabs.find((tab) => tab.startsWith(`search_${CUIAPPItemTypeID}`));
    if (currentTab)
      return arasTabs.selectTab(currentTab);
    arasTabs.openSearch(CUIAPPItemTypeID);
  }
  setupSidebar() {
    this.sidebar.classList.add("cui-app-sidebar");
    this.content.classList.add("cui-app-sidebar-content");
    this.header.classList.add("cui-app-sidebar-header");
    this.header.textContent = "Applications";
    if (this.isAdmin) {
      this.adminBtn = document.createElement("button");
      this.adminBtn.textContent = "Admin Search";
      this.header.appendChild(this.adminBtn);
    }
    this.sidebar.appendChild(this.header);
    this.sidebar.appendChild(this.content);
    document.querySelector("main").prepend(this.sidebar);
    window.addEventListener("click", this.clickHandler.bind(this));
    window.addEventListener("keydown", this.keyHandler.bind(this));
  }
  updateSidebarItems() {
    const sortedApps = this.items.map((item) => {
      return {
        ...item,
        isFavorite: this.favorites.has(item.id)
      };
    }).sort((a, b) => {
      if (a.isFavorite && !b.isFavorite)
        return -1;
      if (!a.isFavorite && b.isFavorite)
        return 1;
      return a.name.localeCompare(b.name);
    });
    this.content.innerHTML = sortedApps.map(itemTemplate).join("");
  }
  async fetchItems() {
    try {
      const appsFetch = await ArasModules.odataFetch("CUI_Application");
      this.items = appsFetch.value;
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }
  getFavorites() {
    this.favorites.clear();
    const state = store.getState();
    const favorites = state.favorites;
    Object.values(favorites).forEach((favorite) => {
      if (!favorite.additional_data)
        return;
      this.favorites.add(favorite.additional_data.id);
    });
  }
  clickHandler(event) {
    const target = event.target;
    const headerBtn = this.getHeaderButton();
    if (!target || !headerBtn)
      return;
    if (headerBtn.contains(target))
      return this.toggleSidebar();
    if (this.adminBtn && this.adminBtn.contains(target))
      return this.openAdminSearch();
    if (this.content.contains(target))
      return this.openItem(target);
    if (this.sidebar.contains(target))
      return;
    this.toggleSidebar(false);
  }
  openItem(target) {
    const itemElement = target.closest("[data-id]");
    if (!itemElement)
      return;
    const itemId = itemElement.getAttribute("data-id");
    if (!itemId)
      return;
    aras.uiShowItem(CUIAPPItemType, itemId);
    this.toggleSidebar(false);
  }
  getHeaderButton() {
    if (this.headerBtn)
      return this.headerBtn;
    const btn = document.querySelector("#headerCommandsBar .cui-app-button");
    if (!btn)
      return;
    this.headerBtn = btn;
    return this.headerBtn;
  }
  keyHandler(event) {
    if (!this.sidebar.hasAttribute("expanded") || event.key !== "Escape")
      return;
    this.toggleSidebar(false);
  }
}

// CodeTree/Client/Solutions/CUI_Application/Scripts/mainView.ts
function initCUIApp() {
  if (window.appsSidebar)
    return;
  window.appsSidebar = new CUIAppMainSidebar;
  checkOpenStartApplication();
}
function checkOpenStartApplication() {
  const url = new URL(window.location.href.toLowerCase());
  const startApp = url.searchParams.get("openapp");
  if (!startApp)
    return;
  const item = aras.newIOMItem("CUI_Application", "get");
  item.setAttribute("maxRecords", "1");
  item.setAttribute("select", "id");
  item.setProperty("url_slug", startApp);
  const response = item.apply();
  if (response.getItemCount() !== 1)
    return;
  aras.uiShowItem("CUI_Application", response.getID());
  url.searchParams.delete("openapp");
  window.history.replaceState({}, document.title, url.toString());
}
initCUIApp();
