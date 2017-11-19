var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, State, Event } from '@stencil/core';
let UserAccounts = class UserAccounts {
    constructor() {
        this.formVisible = false;
        this.shopName = "";
    }
    componentWillLoad() {
    }
    showForm() {
        this.formVisible = true;
    }
    handleShopNameChange(event) {
        this.shopName = event.target.value;
        if (event.target.validity.typeMismatch) {
            console.log('this element is not valid');
        }
    }
    handleFormSubmit(e) {
        e.preventDefault();
        this.createShop.emit({ shopName: this.shopName });
    }
    render() {
        return (h("div", { class: "no-select" }, this.formVisible == true
            ?
                h("form", { onSubmit: (e) => this.handleFormSubmit(e) },
                    "Create Shop",
                    h("label", { class: "block" },
                        h("input", { type: "text", name: "shopName", minlength: "4", placeholder: "Shop Name", value: this.shopName, onInput: (e) => this.handleShopNameChange(e) })),
                    h("button", { type: "submit" }, "Create"))
            :
                h("div", { class: "title", onClick: () => this.showForm() }, "Create Shop")));
    }
};
__decorate([
    State()
], UserAccounts.prototype, "formVisible", void 0);
__decorate([
    State()
], UserAccounts.prototype, "shopName", void 0);
__decorate([
    Event()
], UserAccounts.prototype, "createShop", void 0);
UserAccounts = __decorate([
    Component({
        tag: 'create-shop',
        styleUrl: 'create-shop.scss'
    })
], UserAccounts);
export { UserAccounts };
