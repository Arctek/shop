import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'create-shop',
  styleUrl: 'create-shop.scss'
})
export class UserAccounts {

  @State() formVisible = false;
  @State() shopName = "";

  @Event() createShop: EventEmitter;

  componentWillLoad() {
  }

  showForm() {
    this.formVisible = true;
  }

  handleShopNameChange(event) {
    this.shopName = event.target.value;

    if (event.target.validity.typeMismatch) {
      console.log('this element is not valid')
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
     this.createShop.emit({ shopName: this.shopName });
  }

  render() {
    return (
      <div class="no-select">
        {this.formVisible == true
        ? 
          <form onSubmit={(e) => this.handleFormSubmit(e)}>
            Create Shop
            <label class="block"><input type="text" name="shopName" minlength="4" placeholder="Shop Name" value={this.shopName} onInput={(e) => this.handleShopNameChange(e)} /></label>
            <button type="submit">Create</button>
          </form>
        : 
          <div class="title" onClick={() => this.showForm()}>Create Shop</div>
        }
      </div>
    );
  }
}
