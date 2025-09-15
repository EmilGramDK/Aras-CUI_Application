/**
 * CUI_Application Aras Solution V0.1.0
 * More Info: https://github.com/EmilGramDK/Aras-CUI_Application
 *
 * Class:         CUIAppMainSidebar
 * Created By:    Emil Gram
 * Created On:    15-02-2025
 *
 * Description:   Sidebar for the CUI Application
 */

type Item = {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  app_order?: number;
  app_icon?: string;
};

const CUIAPPItemTypeID = "772CE3BCA6B54634AF93EB25828EC350";
const CUIAPPItemType = "CUI_Application";

const defaultIcon = "../Solutions/CUI_Application/images/default_icon.svg";
const itemTemplate = (item: Item) => `
  <div class="cui-app-sidebar-item" data-id="${item.id}">
    <img src="${item.app_icon || defaultIcon}" />
    <div class="cui-app-sidebar-item-text">
      <h4>${item.isFavorite ? "<span />" : ""} ${item.name}</h4>
      <p>${item.description}</p>
    </div>
    <div class="cui_app-sidebar-item-arrow"></div>
  </div>`;

export class CUIAppMainSidebar {
  private isAdmin: boolean;
  private favorites: Set<string> = new Set();
  private items: Array<Item> = [];
  private sidebar: HTMLElement = document.createElement("div");
  private header: HTMLElement = document.createElement("div");
  private content: HTMLElement = document.createElement("div");
  private adminBtn?: HTMLButtonElement;
  private headerBtn?: HTMLButtonElement;

  constructor() {
    this.isAdmin = aras.isAdminUser();
    this.setupSidebar();
    this.fetchItems().then(() => this.refreshItems());
  }

  public toggleSidebar(force?: boolean) {
    this.sidebar.toggleAttribute("expanded", force);
  }

  public async refreshItems(fetch = false) {
    if (fetch) await this.fetchItems();
    this.getFavorites();
    this.updateSidebarItems();
  }

  private openAdminSearch() {
    this.toggleSidebar(false);
    const currentTab = arasTabs.tabs.find((tab) => tab.startsWith(`search_${CUIAPPItemTypeID}`));
    if (currentTab) return arasTabs.selectTab(currentTab);
    arasTabs.openSearch(CUIAPPItemTypeID);
  }

  private setupSidebar() {
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
    document.querySelector("main")!.prepend(this.sidebar);
    window.addEventListener("click", this.clickHandler.bind(this));
    window.addEventListener("keydown", this.keyHandler.bind(this));
  }

  private updateSidebarItems() {
    const sortedApps = this.items
      .map((item) => {
        return {
          ...item,
          isFavorite: this.favorites.has(item.id),
        };
      })
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
    this.content.innerHTML = sortedApps.map(itemTemplate).join("");
  }

  private async fetchItems() {
    try {
      const appsFetch = (await ArasModules.odataFetch("CUI_Application")) as any;
      this.items = appsFetch.value.map((app: Item) => ({
        ...app,
        app_order: app.app_order || 9999,
      }));
      this.items.sort((a, b) => (a.app_order! < b.app_order! ? -1 : 1));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  private getFavorites() {
    this.favorites.clear();
    const state = store.getState();
    const favorites = state.favorites;
    Object.values(favorites).forEach((favorite: any) => {
      if (!favorite.additional_data) return;
      this.favorites.add(favorite.additional_data.id);
    });
  }

  private clickHandler(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const headerBtn = this.getHeaderButton();
    if (!target || !headerBtn) return;

    if (headerBtn.contains(target)) return this.toggleSidebar();
    if (this.adminBtn && this.adminBtn.contains(target)) return this.openAdminSearch();
    if (this.content.contains(target)) return this.openItem(target);
    if (this.sidebar.contains(target)) return;

    this.toggleSidebar(false);
  }

  private openItem(target: HTMLElement) {
    const itemElement = target.closest("[data-id]") as HTMLElement;
    if (!itemElement) return;
    const itemId = itemElement.getAttribute("data-id");
    if (!itemId) return;
    aras.uiShowItem(CUIAPPItemType, itemId);
    this.toggleSidebar(false);
  }

  private getHeaderButton() {
    if (this.headerBtn) return this.headerBtn;
    const btn = document.querySelector("#headerCommandsBar .cui-app-button") as HTMLButtonElement;
    if (!btn) return;
    this.headerBtn = btn;
    return this.headerBtn;
  }

  private keyHandler(event: KeyboardEvent) {
    if (!this.sidebar.hasAttribute("expanded") || event.key !== "Escape") return;
    this.toggleSidebar(false);
  }
}
