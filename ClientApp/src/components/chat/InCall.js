import React, { Component } from 'react';
import { VideoChat } from './VideoChat';
import { PhoneChat } from './PhoneChat';
import { MessageChat } from './MessageChat';
import { Contact } from '../Contact';

export class InCall extends Component {
    static displayName = InCall.name;

    render() {
        switch (true) {
            case this.props.currentUser?.contactMethod === Contact.contactMethods['video']:
                return <VideoChat key="vc" {...this.props} />;
            case this.props.currentUser?.contactMethod === Contact.contactMethods['phone']:
                return <PhoneChat key="pc" {...this.props} />;
            case this.props.currentUser?.contactMethod === Contact.contactMethods['chat']:
                return <MessageChat key="mc" {...this.props} />;
            default: return null;
        }
    }
}
