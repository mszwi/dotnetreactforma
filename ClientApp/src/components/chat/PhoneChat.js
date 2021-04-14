import React, { Component } from 'react';
import { Calling } from '../modals/Calling';
import { UserDetails } from '../modals/UserDetails';
import { ChatButton } from '../modals/ChatButton';

export class PhoneChat extends Component {
    static displayName = PhoneChat.name;

    constructor(props) {
        super(props);
        this.state = {
            showEditDetails: true,
            caller: null,
            activeCallWindow: null,
            currentCall: null
        };
        this.joinQueue = this.joinQueue.bind(this);
        this.answerCall = this.answerCall.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.rejectCall = this.rejectCall.bind(this);

    }

    componentDidMount() {
        this.props.connection.on("Call", data => {
            // console.log(data);
            this.setState({ caller: data });
        });

        this.props.connection.on("CancelCall", data => {
            this.setState({ caller: null, currentCall: null });
        });

        this.props.connection.on("Answer", data => {
            // console.log(data);
            this.setState({ currentCall: data });
        });

        this.joinQueue(this.props.currentUser);
    }

    componentWillUnmount() {

    }

    joinQueue(user) {
        // console.log("joining queue: ", user);
        this.props.connection.invoke("JoinQueue", user).catch(function (err) {
            return console.error(err.toString());
        });
    }


    answerCall() {
        //this.props.connection.invoke("Answer", this.state.caller).catch(function (err) {
        //    return console.error(err.toString());
        //});
        this.setState({caller: null})
    }

    rejectCall() {
        this.props.connection.invoke("Reject", this.state.caller).catch(function (err) {
            return console.error(err.toString());
        });
        this.setState({ caller: null })
    }

    disconnect() {
        // console.log(this.state.currentCall);
        this.state.activeCallWindow.close();
        this.props.connection.invoke("DisconnectAdmin", this.state.currentCall.Key).catch(function (err) {
            return console.error(err.toString());
        });
    }

    render() {
        let components = [<UserDetails
            key="ud"
            connection={this.props.connection}
            user={this.props.currentUser}
            updateState={(showEditDetails) => this.setState({ showEditDetails })}
            editing={this.state.showEditDetails}
            className="green"
        />];

        switch (true) {
            case this.props.currentCall !== null:
                components.push(<ChatButton disconnect={this.props.disconnect} key="chb" currentUser={this.props.currentUser} onSendMessage={this.props.sendMessage} messages={this.props.messages} currentCall={this.props.currentCall} />);
                break;

            case this.state.caller !== null:
                components.push(<Calling currentUser={this.props.currentUser} key="cab" reject={this.rejectCall} answer={this.answerCall} caller={this.state.caller} />)
                break;
            default:
                break;

        }



        return components;

    }
}
