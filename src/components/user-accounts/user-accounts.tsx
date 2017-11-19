import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'user-accounts',
  styleUrl: 'user-accounts.scss'
})
export class UserAccounts {

  @Prop() accounts = [];
  @Prop() account = '';
  @Prop() callback: Function;

  @State() toggle = false;

  @Event() userAccountSelected: EventEmitter;

  componentWillLoad() {
  }

  toggleClick() {
    this.toggle = !this.toggle;
  }

  selectAccount(act) {
    this.callback(act);
    this.toggleClick();
  }

  render() {
    return (
      <div class={this.toggle ? 'selected': null}>
        {(this.account !== '')
        ? <div class="label no-select" onClick={() => this.toggleClick()}>Account: {this.account}</div>
        : <div class="label no-select" onClick={() => this.toggleClick()}>Account</div>}
        <div class="user-account-menu">
          {this.accounts.map(act => 
            (this.account === act)
            ? <div class="user-account selected">{act}</div>
            : <div class="user-account" onClick={() => this.selectAccount(act)}>{act}</div>
          )}
        </div>
      </div>
    );
  }
}
