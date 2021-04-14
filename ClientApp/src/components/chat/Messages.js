import React, { Component } from 'react';
import anime from 'animejs';

export class Messages extends Component {
    static displayName = Messages.name;

    constructor(props) {
        super(props);
        this.state = {};
        this.renderMessages = this.renderMessages.bind(this);
        this.messagesContainer = React.createRef();
    }

    componentDidUpdate() {
        if (!this.props.connection) {
            return;
        }

        anime({
            targets: this.messagesContainer?.current,
            scrollTop: this.messagesContainer?.current?.scrollHeight,
            duration: 400,
            easing: 'linear'
        });
    }

    renderMessages() {
        return this.props.messages?.map((message, index) => {
            let classname = 'message ' + (this.props.currentUser?.id === message.from?.id ? 'me' : 'them');

            return <div className={classname} key={message.content.slice(0,3) + index}>
                <h3>{message.from?.displayName}</h3>
                <p>{message.content}</p>
            </div>;
        });
    }

    render() {
        if (!this.props.connection) {
            return null;
        }

        return (
            <div className="messages" ref={this.messagesContainer}>
                {this.renderMessages()}
            </div>
        );
    }
}
