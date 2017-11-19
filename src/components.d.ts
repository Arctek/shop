/**
 * This is an autogenerated file created by the Stencil build process.
 * It contains typing information for all components that exist in this project
 * and imports for stencil collections that might be configured in your stencil.config.js file
 */

import '@stencil/router';

import { UserAccounts as CreateShop } from './components/create-shop/create-shop';

interface HTMLCreateShopElement extends CreateShop, HTMLElement {
}
declare var HTMLCreateShopElement: {
  prototype: HTMLCreateShopElement;
  new (): HTMLCreateShopElement;
};
declare global {
  interface HTMLElementTagNameMap {
      "create-shop": HTMLCreateShopElement;
  }
  interface ElementTagNameMap {
      "create-shop": HTMLCreateShopElement;
  }
  namespace JSX {
      interface IntrinsicElements {
          "create-shop": JSXElements.CreateShopAttributes;
      }
  }
  namespace JSXElements {
      export interface CreateShopAttributes extends HTMLAttributes {
          mode?: string,
          color?: string,
        
      }
  }
}

import { ShopApp as ShopApp } from './components/shop-app/shop-app';

interface HTMLShopAppElement extends ShopApp, HTMLElement {
}
declare var HTMLShopAppElement: {
  prototype: HTMLShopAppElement;
  new (): HTMLShopAppElement;
};
declare global {
  interface HTMLElementTagNameMap {
      "shop-app": HTMLShopAppElement;
  }
  interface ElementTagNameMap {
      "shop-app": HTMLShopAppElement;
  }
  namespace JSX {
      interface IntrinsicElements {
          "shop-app": JSXElements.ShopAppAttributes;
      }
  }
  namespace JSXElements {
      export interface ShopAppAttributes extends HTMLAttributes {
          mode?: string,
          color?: string,
        
      }
  }
}

import { UserAccounts as UserAccounts } from './components/user-accounts/user-accounts';

interface HTMLUserAccountsElement extends UserAccounts, HTMLElement {
}
declare var HTMLUserAccountsElement: {
  prototype: HTMLUserAccountsElement;
  new (): HTMLUserAccountsElement;
};
declare global {
  interface HTMLElementTagNameMap {
      "user-accounts": HTMLUserAccountsElement;
  }
  interface ElementTagNameMap {
      "user-accounts": HTMLUserAccountsElement;
  }
  namespace JSX {
      interface IntrinsicElements {
          "user-accounts": JSXElements.UserAccountsAttributes;
      }
  }
  namespace JSXElements {
      export interface UserAccountsAttributes extends HTMLAttributes {
          mode?: string,
          color?: string,
        
          accounts?: any,
          account?: string
      }
  }
}

