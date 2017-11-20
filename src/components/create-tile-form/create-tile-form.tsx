import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'create-tile-form',
  styleUrl: 'create-tile-form.scss'
})
export class CreateTileForm {

  @Prop() title = "";
  @Prop() fields = {};
  @Prop() callback: Function;

  @State() formVisible = false;
  @State() fieldValues = {};

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

    this.callback(this.fieldValues);
  }

  render() {
    let formFields = [];

    if (this.formVisible === true) {
      Object.keys(this.fields).map((item, i) => {
        let name = this.fields[item];

        formFields.push(
          <label class="block"><input type="text" name={item} placeholder={name} value={this.fieldValues[item]} onInput={(event) => this.handleFieldInput(item, event)} /></label>
        );
      });

    }

    return (
      <div class="no-select">
        {this.formVisible === true
        ? 
          <form onSubmit={(e) => this.handleFormSubmit(e)}>
            {this.title}
            {formFields}
            <button type="submit">Create</button>
          </form>
        : 
          <div class="title" onClick={() => this.toggleForm()}>{this.title}</div>
        }
      </div>
    );
  }
}
