import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'shop-product',
  styleUrl: 'shop-product.scss'
})
export class ShopProduct {

  @Prop() account = "";
  @Prop() product = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    image: '',
    merchant: ''
  };
  @Prop() addCartCallback: Function;
  @Prop() editCallback: Function;
  @Prop() deleteCallback: Function;

  @State() toggleForm = false;


  componentWillLoad() {
  }


  render() {
    let product = this.product;

    return (
      <div class="prod-full">
        <img class="prod-image" src={product.image.trim()} />
        <div class="prod-title">{product.name}</div>
        <div class="prod-sku">{product.sku}</div>
        <div class="prod-category">{product.category}</div>
        <div class="prod-price">{product.price.toString(10)} wei</div>
        <div class="prod-stock">{product.stock.toString(10)} wei</div>
        <button>Add to Cart</button>
        {this.account === product.merchant
        ? <div class="merchant-opts">
            <button>Edit</button>
            <button>Delete</button>
          </div>
        : <div />
        }
      </div>
    );
  }
}
