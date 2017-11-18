/*! Built with http://stenciljs.com */

App.loadStyles("user-accounts","user-accounts {\n  font-family: Courier New, Courier, monospace;\n  font-weight: bold;\n  float: right;\n  position: relative;\n}\n\n.label {\n  cursor: pointer;\n  padding: 6px 11px;\n  border: 1px solid #fff;\n  border-radius: 4px;\n}\n\n.selected .label {\n  color: #DE7150;\n  background: #fff;\n}\n\n.user-account-menu {\n  display: none;\n}\n\n.selected .user-account-menu {\n  display: block;\n  position: absolute;\n  top: 100%;\n  border: 1px solid #aaa;\n  background: #fff;\n  color: #000;\n  padding: 12px;\n  border-radius: 4px;\n  box-shadow: 1px 1px rgba(0, 0, 0, 0.2);\n  right: 0;\n  margin-top: 10px;\n  line-height: 2;\n}\n\n.user-account {\n  cursor: pointer;\n}\n\n.user-account.selected, .user-account:hover {\n  color: #DE7150;\n}\nuser-accounts.hydrated{visibility:inherit}");
App.loadComponents(

/**** module id (dev mode) ****/
"user-accounts",

/**** component modules ****/
function importComponent(exports, h, Context, publicPath) {
"use strict";
// @stencil/core

var UserAccounts = /** @class */ (function () {
    function UserAccounts() {
        this.accounts = [];
        this.account = '';
        this.toggle = false;
    }
    UserAccounts.prototype.componentWillLoad = function () {
    };
    UserAccounts.prototype.toggleClick = function () {
        this.toggle = !this.toggle;
    };
    UserAccounts.prototype.selectAccount = function (act) {
        this.userAccountSelected.emit({ account: act });
        this.toggleClick();
    };
    UserAccounts.prototype.render = function () {
        var _this = this;
        return (h("div", { class: this.toggle ? 'selected' : null },
            (this.account !== '')
                ? h("div", { class: "label no-select", onClick: function () { return _this.toggleClick(); } },
                    "Account: ",
                    this.account)
                : h("div", { class: "label no-select", onClick: function () { return _this.toggleClick(); } }, "Account"),
            h("div", { class: "user-account-menu" }, this.accounts.map(function (act) {
                return (_this.account === act)
                    ? h("div", { class: "user-account selected" }, act)
                    : h("div", { class: "user-account", onClick: function () { return _this.selectAccount(act); } }, act);
            }))));
    };
    return UserAccounts;
}());

exports['user-accounts'] = UserAccounts;
},


/***************** user-accounts *****************/
[
/** user-accounts: tag **/
"user-accounts",

/** user-accounts: members **/
[
  [ "account", /** prop **/ 1, /** observe attribute **/ 1, /** type string **/ 2 ],
  [ "accounts", /** prop **/ 1, /** do not observe attribute **/ 0, /** type any **/ 1 ],
  [ "toggle", /** state **/ 5, /** do not observe attribute **/ 0, /** type any **/ 1 ]
],

/** user-accounts: host **/
{},

/** user-accounts: events **/
[
  [
    /*****  user-accounts userAccountSelected ***** /
    /* event name ***/ "userAccountSelected"
  ]
]

]
);