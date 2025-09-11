/**
 * CUI_Application Aras Solution V0.1.0
 * More Info: https://github.com/EmilGramDK/Aras-CUI_Application
 *
 * Class:         CuiAppLayout
 * Created By:    Emil Gram
 * Created On:    15-02-2025
 *
 * Description:   This class is responsible for managing the layout of the CUI_Application item.
 *                It extends the CuiLayout class and implements the necessary methods to handle the application layout.
 *                The class is used to display the application item in the main window and manage the application state.
 */

import { CuiLayout } from "../../../jsBundles/cui.es.js";

class CuiAppLayout extends CuiLayout {
  definedControls = new Map([
    ["ItemView.Sidebar", document.createElement("aras-viewers-tabs")],
    ["ItemView.Spinner", window.document.querySelector("aras-spinner")],
  ]);

  constructor(dom, itemId) {
    if (!aras || !ArasModules) throw new Error("Aras Object & ArasModules are required");
    if (!itemId) throw new Error("itemId is required");
    if (!dom) throw new Error("dom is required");

    super(dom, "", { itemTypeName: "CUI_Application", itemId });
  }

  async init() {
    await this.#fetchItemAndPages();
    this.initialState = { ...this.options, title: this.appItem.name };
    await super.init();
    await this.initLayout();
  }

  async initLayout() {
    this.#initTopControls();
    this.#updateTitleTab();
    this.#initSinglePage();
    this.#initMultiPages();
    this.#appendCssToItemView();
    this.#runInitMethod();
    this.hideSpinner();
  }

  #initTopControls() {
    this.titleBar = window.document.querySelector("aras-toolbar.aras-titlebar");
    this.commandbar = window.document.querySelector("aras-toolbar.aras-commandbar");
  }

  #updateTitleTab() {
    top?.window.arasTabs.updateTitleTab(window.name, {
      label: this.appItem.tab_label || this.appItem.name,
      image: this.appItem.icon || "../Solutions/CUI_Application/images/default_icon.svg",
    });
  }

  #initSinglePage() {
    if (this.appItem.classification !== "Single Page") return;

    const switcher = document.querySelector("aras-switcher#viewers");
    if (!switcher) return;

    const iframe = document.createElement("iframe");
    iframe.classList.add(
      "aras-switcher-pane_border_none",
      "aras-switcher-pane",
      "aras-switcher-pane_active",
    );
    iframe.id = this.appItem.id;
    iframe.src = this.appItem.page_url;
    iframe.setAttribute("aria-hidden", "false");
    iframe.setAttribute("switcher-pane-id", this.appItem.id);

    this.#appendCssToIframe(iframe);
    switcher.appendChild(iframe);
    switcher.setAttribute("active-pane-id", this.appItem.id);
  }

  #initMultiPages() {
    if (this.appItem.classification === "Single Page") return;

    const showSidebar = this.appItem.show_sidebar == "1";
    const viewersTabs = this.definedControls.get("ItemView.Sidebar");
    const switcher = document.querySelector("aras-switcher#viewers");
    if (!viewersTabs || !switcher) return;

    this.appPages.forEach((page, index) => {
      const iframe = document.createElement("iframe");
      iframe.classList.add("aras-switcher-pane_border_none", "aras-switcher-pane");
      iframe.id = page.name;
      iframe.setAttribute("aria-hidden", "true");
      iframe.setAttribute("switcher-pane-id", page.name);
      iframe.dataset.src = page.page_url;

      const _removeAttribute = iframe.removeAttribute;
      iframe.removeAttribute = function (name) {
        if (name === "aria-hidden" && !this.src) {
          this.src = this.dataset.src;
        }
        _removeAttribute.call(this, name);
      };

      this.#appendCssToIframe(iframe);
      switcher.appendChild(iframe);
    });

    viewersTabs.classList.add("aras-item-view__viewers-tabs");
    viewersTabs.switcher = switcher;
    viewersTabs.style.display = showSidebar ? "block" : "none";
    this.dom.prepend(viewersTabs);
    this.sidebar = viewersTabs;

    // select tab where is_default=1
    const defaultPage = this.appPages.find((page) => page.is_default === "1");
    if (defaultPage) {
      viewersTabs.selectTab(defaultPage.name);
    }
  }

  async _getCuiControls() {
    const promises = [this.#getTopControls(), this.#getSidebarControl()];
    const [topControls, sidebarControl] = await Promise.all(promises);

    const controls = [...topControls, sidebarControl];
    return controls;
  }

  attachCssItemTypeColor() {
    const color = this.appItem.color || "#303f9f";
    const activeColor = this.appItem.active_color || "rgba(255,255,255,0.4);";
    document.body.style.setProperty("--item-type-color", color);
    document.body.style.setProperty("--item-type-active-color", activeColor);
  }

  async #getTopControls() {
    const { titleBarItems, commandBarItems } = await this.#fetchMenuItems();
    const controls = [];

    const titlebar = {
      control_type: "ToolbarControl",
      name: "ItemView.TitleBar",
      additional_data: {
        cssClass: "aras-titlebar",
        attributes: { role: "heading", "aria-level": "1" },
      },
      CommandBarItems: [
        {
          name: "appview.titlebar.appicon",
          image: this.appItem.icon || "../Solutions/CUI_Application/images/default_icon.svg",
          type: "image",
          cssClass: "aras-toolbar__icon",
          tooltip_template: this.appItem.name,
        },
        {
          type: "text",
          name: "appview.titlebar.appname",
          cssClass: "aras-toolbar__title aras-toolbar__title-view",
          tooltip_template: "Click to view more info",
          on_init_handler: this.#getMethodId("CUI_Application_Title_Init"),
          include_events: "UpdateState",
        },
        {
          type: "button",
          name: "appview.titlebar.favorite",
          on_init_handler: this.#getMethodId("CUI_Application_Favorite_Init"),
          on_click_handler: this.#getMethodId("CUI_Application_Favorite_Click"),
          include_events: "UpdateProps,UpdateTearOffWindowState",
          cssClass: "aras-button_d",
          hidden: true,
        },
        ...titleBarItems,
      ],
    };
    controls.push(titlebar);

    const commandbar = {
      "@type": "cui_Control",
      additional_data: {
        cssClass: "aras-commandbar",
      },
      control_type: "ToolbarControl",
      name: "ItemView.Toolbar",
      sort_order: "256",
      CommandBarItems: commandBarItems,
    };
    controls.push(commandbar);

    return controls;
  }

  async #getSidebarControl() {
    const pages = this.appPages.map((page, index) => ({
      "@type": "CommandBarButton",
      id: page.name,
      name: page.name,
      tooltip_template: page.label,
      label: page.label,
      image: page.icon || "../Solutions/CUI_Application/images/default_tab.svg",
      sort_order: page.sort_order || 0,
      cssClass: page.is_hidden === "1" ? "cui_app-hidden" : "",
      ...(page.image_additional ? { image_additional: page.active_icon } : {}),
    }));

    return {
      "@type": "cui_Control",
      control_type: "TabsControl",
      name: "ItemView.Sidebar",
      sort_order: "1280",
      hidden: this.appItem.show_sidebar !== "1" || !pages.length,
      CommandBarItems: pages,
    };
  }

  async #fetchMenuItems() {
    const itemId = this.options.itemId;
    const items = await window.ArasModules.odataFetch(
      `CUI_Application_Toolbar_Items
      ?$filter=source_id eq '${itemId}'
      &$expand=related_id($select=id,name,label,tooltip_template,image,additional_data,on_click_handler,on_init_handler)
      &$select=id,location,sort_order`,
    );

    const formattedItems = items.value.map((item) => {
      const type = item.related_id["@odata.type"].replace("#", "");
      const onInitHandler = item.related_id["on_init_handler@aras.id"];
      const onClickHandler = item.related_id["on_click_handler@aras.id"];
      const additionalData = JSON.parse(item.related_id.additional_data || "{}");

      return {
        "@type": type,
        id: item.related_id.id,
        name: item.related_id.name,
        label: item.related_id.label || "",
        tooltip_template: item.related_id.tooltip_template || "",
        image: item.related_id.image || "",
        additional_data: additionalData,
        on_init_handler: onInitHandler,
        on_click_handler: onClickHandler,
        location: item.location,
      };
    });

    const titleBarItems = formattedItems.filter((item) => item.location == "titlebar") || [];
    const commandBarItems = formattedItems.filter((item) => item.location == "commandbar") || [];

    return { titleBarItems, commandBarItems };
  }

  async #fetchItemAndPages() {
    const itemId = this.options.itemId;
    const promises = [
      ArasModules.odataFetch(
        `CUI_Application('${itemId}')?$expand=init_method($select=id,method_type)`,
      ),
      ArasModules.odataFetch(
        `CUI_Application_Pages?$filter=source_id eq '${itemId}'&$orderby=sort_order`,
      ),
    ];

    const [item, pages] = await Promise.all(promises);

    this.appItem = item;
    this.appPages = pages?.value?.length
      ? pages.value
      : [
          {
            name: "demo_page",
            page_url: "../Solutions/CUI_Application/html/demo.html",
            is_default: "1",
            label: "Demo Page",
          },
        ];
  }

  #getMethodId(methodName) {
    const method = window.aras.MetadataCache.GetClientMethodNd(methodName, "name");
    if (!method) throw new Error(`Method ${methodName} not found`);
    return method.getAttribute("id");
  }

  #appendCssToItemView() {
    if (document.getElementById("aras-cui-app-itemview-styles")) return;
    const style = document.createElement("style");
    style.id = "aras-cui-app-itemview-styles";
    style.innerHTML = this.appItem.app_css || "";
    document.head.appendChild(style);
  }

  #appendCssToIframe(iframe) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = window.aras.getBaseURL("/Solutions/CUI_Application/styles/itemPage.css");
    iframe.addEventListener("load", () => {
      iframe.contentDocument?.head.prepend(link);
    });
  }

  #runInitMethod() {
    if (!this.appItem.init_method) return;
    window.aras.evalMethod(this.appItem.init_method.id);
  }

  toggleSpinner(activeValue, force = false) {
    const spinner = this.definedControls.get("ItemView.Spinner");
    if (!spinner) return;

    if (force) {
      spinner.active = activeValue;
      return;
    }

    const isActive = spinner.active != null;

    if (isActive && !activeValue) {
      spinner.hide();
    } else if (!isActive && activeValue) {
      spinner.show();
    }
  }

  mapStateToProps(state) {
    const { favorites } = state;

    const permissionId = this.appItem.permission_id;

    const favorite = Object.values(favorites).find(
      (item) => item.additional_data.id === this.appItem.id && item.category === "Item",
    );

    return {
      favorite,
      permissionItem: state.localChanges["Permission"]?.[permissionId],
    };
  }

  showSpinner() {
    this.toggleSpinner(true, true);
  }

  hideSpinner() {
    this.toggleSpinner(false, true);
  }

  updateLayout(prevProps, prevState) {
    console.log("Layout State Changed!");
  }

  _preloadDeferredLocations() {
    return Promise.resolve();
  }

  initializeItemTypeMetadata(itemTypeName) {
    return Promise.resolve();
  }
}

window.CuiAppLayout = CuiAppLayout;

export { CuiAppLayout };
