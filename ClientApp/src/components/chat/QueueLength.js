import React, { Component } from 'react';

export class QueueLength extends Component {
    static displayName = QueueLength.name;

    render() {
        if (this.props.queueLength === null) {
            return null;
        }
        return <p>The queue is currently {this.props.queueLength} people</p>;
    }
}
