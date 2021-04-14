import React, { Component } from 'react';

export class Products extends Component {
    static displayName = Products.name;

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
       <h1>Products</h1>
      </div>
    );
  }
}
