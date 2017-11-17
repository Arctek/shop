import { Component, Prop } from '@stencil/core';


@Component({
  tag: 'shop-app',
  styleUrl: 'my-name.scss'
})
export class ShopApp {

  @Prop() first: string;

  @Prop() last: string;

  render() {
    return (
      <div>
        Hello, my props are {this.first} {this.last}
      </div>
    );
  }
}
