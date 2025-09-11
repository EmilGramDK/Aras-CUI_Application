/**
 * CUI_Application Aras Solution V0.1.0
 * More Info: https://github.com/EmilGramDK/Aras-CUI_Application
 *
 * Class:         CuiAppMainView
 * Created By:    Emil Gram
 * Created On:    15-02-2025
 *
 * Description:   Main view class for the CUI application.
 */

import { CUIAppMainSidebar } from "./sidebar.js";

declare global {
  interface Window {
    appsSidebar: CUIAppMainSidebar;
  }
}

function initCUIApp() {
  if (window.appsSidebar) return;
  window.appsSidebar = new CUIAppMainSidebar();
  checkOpenStartApplication();
}

/**
 * Attempts to open an application if specified in the URL query parameter (`openapp`).
 * Retrieves the application ID using the `url_slug` property.
 */
function checkOpenStartApplication() {
  const url = new URL(window.location.href.toLowerCase());
  const startApp = url.searchParams.get("openapp");
  if (!startApp) return; // No application specified in the URL

  const item = aras.newIOMItem("CUI_Application", "get");
  item.setAttribute("maxRecords", "1");
  item.setAttribute("select", "id");
  item.setProperty("url_slug", startApp);

  const response = item.apply();
  if (response.getItemCount() !== 1) return; // No matching application found

  aras.uiShowItem("CUI_Application", response.getID()); // Open the found application

  // Remove 'openapp' from the URL without triggering a page reload
  url.searchParams.delete("openapp");
  window.history.replaceState({}, document.title, url.toString());
}

initCUIApp();
