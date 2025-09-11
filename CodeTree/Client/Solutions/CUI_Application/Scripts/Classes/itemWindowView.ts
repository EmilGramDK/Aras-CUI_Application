// eslint-disable-next-line
// @ts-nocheck
ModulesManager.define(
  ["aras.innovator.core.ItemWindow/DefaultItemWindowView"],
  null,
  function (DefaultItemWindowView) {
    function ItemWindowView(inDom, inArgs) {
      this._itemTypeName = inDom.getAttribute("type");
      this._itemId = inDom.getAttribute("id");
      this._showDefaultView = inArgs.showDefaultView;

      DefaultItemWindowView.call(this, inDom, inArgs);
    }

    ItemWindowView.prototype = Object.assign(Object.create(DefaultItemWindowView.prototype), {
      constructor: ItemWindowView,

      getViewUrl: function () {
        if (this._showDefaultView) {
          return "/Modules/aras.innovator.core.ItemWindow/cuiTabItemView";
        }

        return "/Solutions/CUI_Application/itemView?itemId=" + this._itemId;
      },
    });

    return ItemWindowView;
  },
);
