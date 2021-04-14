import React, { Component } from 'react';
import styleHelper from './styleHelpers';
import { Button } from 'reactstrap';
export class LargeButton extends Component {
    static displayName = LargeButton.name;

  constructor(props) {
    super(props);
    this.state = {};
  }

    render() {
        let styles = { backgroundColor: styleHelper.styles.black, color: styleHelper.styles.white };

        if (this.props.show === undefined || this.props.show) {
            return (
                <Button onClick={this.props.onClick} className="large-button" style={styles}>
                    {this.props.children}
                </Button>
            );
        } else {
            return null;
        }
  }
}
