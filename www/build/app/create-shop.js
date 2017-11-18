/*! Built with http://stenciljs.com */

App.loadStyles("create-shop","create-shop {\n  font-family: Arial, Helvetica, sans serif, serif;\n  display: inline-block;\n  border: 1px solid #ddd;\n  border-radius: 6px;\n  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);\n  overflow: hidden;\n}\n\n.title {\n  transition: background-color 180ms;\n  padding: 3rem;\n  font-size: 2rem;\n}\n\n.title:hover {\n  background: #85cadb;\n  cursor: pointer;\n}\n\nform {\n  padding: 2rem;\n  font-size: 1.1rem;\n}\n\n.block {\n  display: block;\n  margin-top: 1.1rem;\n}\ncreate-shop.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"create-shop",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
// @stencil/core

var UserAccounts = /** @class */ (function () {
    function UserAccounts() {
        this.formVisible = false;
        this.shopName = "";
    }
    UserAccounts.prototype.componentWillLoad = function () {
    };
    UserAccounts.prototype.showForm = function () {
        this.formVisible = true;
    };
    UserAccounts.prototype.handleShopNameChange = function (event) {
        this.shopName = event.target.value;
        if (event.target.validity.typeMismatch) {
            console.log('this element is not valid');
        }
    };
    UserAccounts.prototype.handleFormSubmit = function (e) {
        e.preventDefault();
        this.createShop.emit({ shopName: this.shopName });
    };
    UserAccounts.prototype.render = function () {
        var _this = this;
        return (h("div", { class: "no-select" }, this.formVisible == true
            ?
                h("form", { onSubmit: function (e) { return _this.handleFormSubmit(e); } },
                    "Create Shop",
                    h("label", { class: "block" },
                        h("input", { type: "text", name: "shopName", minlength: "4", placeholder: "Shop Name", value: this.shopName, onInput: function (e) { return _this.handleShopNameChange(e); } })),
                    h("button", { type: "submit" }, "Create"))
            :
                h("div", { class: "title", onClick: function () { return _this.showForm(); } }, "Create Shop")));
    };
    return UserAccounts;
}());

exports['create-shop'] = UserAccounts;
},


/***************** create-shop *****************/
[
/** create-shop: tag **/
"create-shop",

/** create-shop: members **/
[
  [ "formVisible", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "shopName", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ]
],

/** create-shop: host **/
{},

/** create-shop: events **/
[
  [
    /*****  create-shop createShop ***** /
    /* event name ***/ "createShop"
  ]
]

]
);