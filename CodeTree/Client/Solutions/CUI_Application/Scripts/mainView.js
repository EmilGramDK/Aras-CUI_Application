/**
 * CUI_Application Aras Solution V1.0.0
 * More Info: https://github.com/EmilGramDK/Aras-CUI_Application
 *
 * Class:         CuiAppMainView
 * Created By:    Emil Gram
 * Created On:    15-02-2025
 *
 * Description:   Main view class for the CUI application.
 */

import { CuiAppMainViewSidebar } from "./mainViewSidebar.js?ver=1.0.0";

class CuiAppMainView {
  static init() {
    CuiAppMainViewSidebar.init();
  }
}

CuiAppMainView.init();

window.CuiAppMainView = CuiAppMainView;
