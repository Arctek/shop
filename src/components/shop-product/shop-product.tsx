import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'shop-product',
  styleUrl: 'shop-product.scss'
})
export class ShopProduct {

  @Prop() account = "";
  @Prop() address = "";
  @Prop() shop = "";
  @Prop() data = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    image: '',
    merchant: ''
  };

  @State() fieldValues = {};

  @Event() addCartAction: EventEmitter;
  @Event() deleteProductAction: EventEmitter;
  @Event() editProductAction: EventEmitter;

  @State() formVisible = false;


  componentWillLoad() {
  }

  toggleForm() {
    this.formVisible = !this.formVisible;
  }

  handleFieldInput(key, event) {
    this.fieldValues[key] = event.target.value;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    //this.editCallback(this.fieldValues);
    this.editProductAction.emit({ fields: this.fieldValues });

    this.toggleForm();
  }

  addToCart() {
    this.addCartAction.emit({ shop: this.shop, product: this.address });
  }

  delete() {
    this.deleteProductAction.emit({ shop: this.shop, product: this.address });
  }

  render() {
    let product = this.data;

    if (this.formVisible && this.account === product.merchant) {
      let formFields = [];

      let fields = { 
          name: "Product Name",
          sku: "SKU",
          category: "Category",
          price: "Price",
          stock: "Stock",
          image: "Image"
        }; 

      Object.keys(fields).map((item, i) => {
        let name = fields[item];

        this.fieldValues[item] = this.fieldValues[item] ? this.fieldValues[item] : this.data[item];

        formFields.push(
          <label class="block"><input type="text" name={item} placeholder={name} value={this.fieldValues[item]} onInput={(event) => this.handleFieldInput(item, event)} /></label>
        );
      });

      return (
        <form onSubmit={(e) => this.handleFormSubmit(e)}>
          Edit Product
          {formFields}
          <button type="submit">Save</button>
        </form>
      );
    }

    return (
      <div class="prod-full">
        <div class="title-bar">
          <div class="product-back"><stencil-route-link url={"/shop/" + this.shop}>Back</stencil-route-link></div>
          <h2>{product.name}</h2>
          <div class="address">{this.address}</div>
        </div>
        <img class="prod-image" src={product.image.trim()} />
        <div class="prod-details">
          <div class="prod-title">{product.name}</div>
          <div class="prod-sku">{product.sku}</div>
          <div class="prod-category">{product.category}</div>
          <div class="prod-price">{product.price.toString(10)} wei</div>
          <div class="prod-stock">{product.stock.toString(10)}</div>
          <button onClick={() => this.addToCart()}>Add to Cart</button>
          {this.account === product.merchant
          ? <div class="merchant-opts">
              <button onClick={() => this.toggleForm()}>Edit</button>
              <button onClick={() => this.delete()}>Delete</button>
            </div>
          : <div />
          }
        </div>
      </div>
    );
  }
}
