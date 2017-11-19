var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Prop, State, Event } from '@stencil/core';
let UserAccounts = class UserAccounts {
    constructor() {
        this.accounts = [];
        this.account = '';
        this.toggle = false;
    }
    componentWillLoad() {
    }
    toggleClick() {
        this.toggle = !this.toggle;
    }
    selectAccount(act) {
        this.userAccountSelected.emit({ account: act });
        this.toggleClick();
    }
    render() {
        return (h("div", { class: this.toggle ? 'selected' : null },
            (this.account !== '')
                ? h("div", { class: "label no-select", onClick: () => this.toggleClick() },
                    "Account: ",
                    this.account)
                : h("div", { class: "label no-select", onClick: () => this.toggleClick() }, "Account"),
            h("div", { class: "user-account-menu" }, this.accounts.map(act => (this.account === act)
                ? h("div", { class: "user-account selected" }, act)
                : h("div", { class: "user-account", onClick: () => this.selectAccount(act) }, act)))));
    }
};
__decorate([
    Prop()
], UserAccounts.prototype, "accounts", void 0);
__decorate([
    Prop()
], UserAccounts.prototype, "account", void 0);
__decorate([
    State()
], UserAccounts.prototype, "toggle", void 0);
__decorate([
    Event()
], UserAccounts.prototype, "userAccountSelected", void 0);
UserAccounts = __decorate([
    Component({
        tag: 'user-accounts',
        styleUrl: 'user-accounts.scss'
    })
], UserAccounts);
export { UserAccounts };
