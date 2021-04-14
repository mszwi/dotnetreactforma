import React, { Component } from 'react';
import { ChatButton } from '../modals/ChatButton';
import { UserDetails } from '../modals/UserDetails';

export class MessageChat extends Component {
    static displayName = MessageChat.name;

  constructor(props) {
    super(props);
    this.state = {};
  }

    render() {
        let userDetails = <UserDetails key="ud"
          connection={this.props.connection}
          user={this.props.currentUser}
          className="green"
      />
        let chatButton = <ChatButton key="chb" disconnect={this.props.disconnect} currentUser={this.props.currentUser} onSendMessage={this.props.sendMessage} messages={this.props.messages} currentCall={this.props.currentCall} />;
      let components = [
          userDetails,
          chatButton
      ];

      return components;
  }
}
