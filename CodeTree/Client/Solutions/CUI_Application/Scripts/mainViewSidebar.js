/**
 * CUI_Application Aras Solution V1.0.0
 * More Info: https://github.com/EmilGramDK/Aras-CUI_Application
 *
 * Class:         CuiAppMainViewSidebar
 * Created By:    Emil Gram
 * Created On:    15-02-2025
 *
 * Description:   Sidebar for the CUI Application
 */

window.CuiAppSidebarStatus = "pending";

class CuiAppMainViewSidebar {
  static init() {
    if (document.getElementById("cui_app-sidebar")) return;

    const sidebarOverlay = document.createElement("div");
    sidebarOverlay.id = "cui_app-sidebar-overlay";

    const isAdmin = aras.isAdminUser();

    const sidebar = document.createElement("div");
    sidebar.id = "cui_app-sidebar";
    sidebar.classList.add("cui_app-sidebar");
    sidebar.style.opacity = 0;
    sidebar.innerHTML = `
    <div class="cui_app-sidebar-header">Applications ${
      isAdmin ? '<button onclick="CuiAppMainViewSidebar.openAdminSearch()">Admin Search</button>' : ""
    }</div>
    <div class="cui_app-sidebar-content" id="cui_app-sidebar-items"></div>`;
    document.querySelector("main").prepend(sidebar);
    document.querySelector("main").prepend(sidebarOverlay);

    window.CuiAppSidebarStatus = "resolved";
  }

  static toggleSidebar() {
    const sidebar = document.getElementById("cui_app-sidebar");
    if (!sidebar) return;
    if (sidebar.classList.contains("cui_app-sidebar-open")) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  static openSidebar() {
    const sidebar = document.getElementById("cui_app-sidebar");
    const sidebarOverlay = document.getElementById("cui_app-sidebar-overlay");
    if (!sidebar || !sidebarOverlay) return;

    this.updateSidebarWithItems();

    sidebar.classList.add("cui_app-sidebar-open");
    sidebarOverlay.classList.add("cui_app-sidebar-open");
    sidebarOverlay.addEventListener("click", this.eventHandler);
    window.addEventListener("keydown", this.eventHandler);
  }

  static closeSidebar() {
    const sidebar = document.getElementById("cui_app-sidebar");
    const sidebarOverlay = document.getElementById("cui_app-sidebar-overlay");
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.remove("cui_app-sidebar-open");
    sidebarOverlay.classList.remove("cui_app-sidebar-open");
    sidebarOverlay.removeEventListener("click", this.eventHandler);
    window.removeEventListener("keydown", this.eventHandler);
  }

  static async updateSidebarWithItems() {
    const itemsElement = document.getElementById("cui_app-sidebar-items");
    if (!itemsElement) return;

    itemsElement.innerHTML = '<span class="CUIApp_skeleton">';

    const favoriteItemsMap = this.getFavoriteItems();
    const appsFetch = await ArasModules.odataFetch("CUI_Application");
    const apps = appsFetch.value || [];

    const sortedApps = apps
      .map((app) => {
        const favorite = favoriteItemsMap.get(app.id);
        return {
          ...app,
          favorite: favorite ? true : false,
        };
      })
      .sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
      });

    itemsElement.innerHTML = "";
    sortedApps.forEach((app) => {
      itemsElement.insertAdjacentHTML("beforeend", this.getSidebarItemTemplate(app));
    });
  }

  static getSidebarItemTemplate(app) {
    const icon = app.icon || "../Solutions/CUI_Application/images/default_icon.svg";
    return `
    <div class="cui_app-sidebar-item" onclick="CuiAppMainViewSidebar.openApp('${app.id}')">
        <div class="cui_app-sidebar-item-icon">
            <img src="${icon}" />
        </div>
        <div class="cui_app-sidebar-item-text">
            <h4>${app.favorite ? "<span />" : ""} ${app.name}</h4>
            <p>${app.description}</p>
        </div>
        <div class="cui_app-sidebar-item-arrow"></div>
    </div>`;
  }

  static getFavoriteItems() {
    const state = store.getState();
    const favorites = state.favorites;
    const map = new Map();

    Object.values(favorites).forEach((favorite) => {
      if (!favorite.additional_data) return;
      map.set(favorite.additional_data.id, favorite);
    });

    return map;
  }

  static openApp(itemId) {
    CuiAppMainViewSidebar.closeSidebar();
    aras.uiShowItem("CUI_Application", itemId);
  }

  static openAdminSearch() {
    CuiAppMainViewSidebar.closeSidebar();

    // check if there is an open tab with a name that starts with "search_772CE3BCA6B54634AF93EB25828EC350"
    const currentTab = top.arasTabs.tabs.find((tab) => tab.startsWith("search_772CE3BCA6B54634AF93EB25828EC350"));

    // if there is an open tab with the search, focus on it
    if (currentTab) {
      top.arasTabs.selectTab(currentTab);
      return;
    }

    top.arasTabs.openSearch("772CE3BCA6B54634AF93EB25828EC350");
  }

  static eventHandler(event) {
    if (event.key === "Escape" || event.target.id === "cui_app-sidebar-overlay") {
      CuiAppMainViewSidebar.closeSidebar();
    }
  }
}

window.CuiAppMainViewSidebar = CuiAppMainViewSidebar;
export { CuiAppMainViewSidebar };
