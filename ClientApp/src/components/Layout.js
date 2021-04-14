import React, { Component } from 'react';
import { NavMenu } from './nav/NavMenu';
import authService from './api-authorization/AuthorizeService'

export class Layout extends Component {
  static displayName = Layout.name;
    renderNav() {
        if (!authService.isAuthenticated()) {
            return null;
        }
        return <NavMenu location={this.props.location} />;
    }
  render () {
    return (
        <div>
            {this.renderNav()}
            {this.props.children}
      </div>
    );
  }
}
