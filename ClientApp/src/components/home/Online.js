import React, { Component } from 'react';
import { LargeIconButton } from './LargeIconButton';
import { faVideo, faPhone, faComments } from '@fortawesome/free-solid-svg-icons';
import { updateDetails } from './signalRService';


export class Online extends Component {
    static displayName = Online.name;

    constructor(props) {
        super(props);
        this.state = {
            messages:[]
        };
       
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentDidMount() {
       
        this.props.connection.on("ReceiveMessage", data => {
            // console.log(data);
            let messages = this.state.messages;
            messages.push(data);
            this.setState({ messages });
        });

    }

    sendMessage(connectionId, message) {
        this.props.connection.invoke("SendPrivateMessage", connectionId , message).catch(function (err) {
            return console.error(err.toString());
        });

    }

    updateContactMethod(method) {
        // console.log(method);
        let user = this.props.currentUser;
        user.contactMethod = method;
        updateDetails(this.props.connection, user);
    }

    render() {

                return (
                    <div className="contact-buttons">
                        <LargeIconButton onClick={() => { this.updateContactMethod(1) }} backgroundColor={this.props.settings.farge} faIcon={faVideo} label="En til en video" show={true} />
                        <LargeIconButton onClick={() => { this.updateContactMethod(2) }} backgroundColor={this.props.settings.farge} faIcon={faPhone} label="Telefon" show={true} />
                        <LargeIconButton onClick={() => { this.updateContactMethod(3) }} backgroundColor={this.props.settings.farge} faIcon={faComments} label="En til chat" show={true} />
                    </div>
                )


        
    }
}
