import React, { Component } from 'react';
import { Calling } from '../modals/Calling';
import { UserDetails } from '../modals/UserDetails';
import { ChatButton } from '../modals/ChatButton';
import { Contact } from '../Contact';
import { updateDetails } from '../signalRService';

export class VideoChat extends Component {
    static displayName = VideoChat.name;

  constructor(props) {
    super(props);
      this.state = {
          caller: null,
          activeCallWindow: null,
      };
      this.joinQueue = this.joinQueue.bind(this);
      this.answerCall = this.answerCall.bind(this);
      this.rejectCall = this.rejectCall.bind(this);

    }

    componentDidMount() {
        this.props.connection.on("Call", data => {
            // console.log(data);
            this.setState({ caller: data });
        });

        this.props.connection.on("Disconnect", data => {
            // console.log(data);
            this.setState({ caller: null });
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
        console.log(this.state.caller);
        this.props.connection.invoke("Answer", this.state.caller).catch(function (err) {
            return console.error(err.toString());
        });

        //let connectionString;

        //if (this.state.caller.wherebyLink !== null && this.state.caller.wherebyLink !== undefined && this.state.caller.wherebyLink.includes('http')) {
        //    connectionString = this.state.caller.wherebyLink;
        //} else {
        //    connectionString = 'https://' + this.state.caller.wherebyLink;
        //}


        //if (this.state.caller.wherebyLink !== undefined) {
        //    let myWindow = window.open(connectionString, '_blank');   // Opens a new window
        //    console.log(myWindow);

        //    myWindow.addEventListener('beforeunload', () => {
        //        console.log('window-closed');
        //        //alert("It looks like you have left the call");
        //    });

        //    myWindow.focus();

        //    this.setState({ activeChatWindow: myWindow });
        //}
        
    }

    rejectCall() {
        this.props.connection.invoke("Reject", this.state.caller).catch(function (err) {
            return console.error(err.toString());
        });
        this.setState({ caller: null })
    }


    changeContactMethod() {
        let user = this.props.currentUser;
        user.contactMethod = Contact.contactMethods.none;
        updateDetails(this.props.connection, user);
    }


    render() {
        let userDetails = <UserDetails key="ud"
            connection={this.props.connection}
            user={this.props.currentUser}
            className="green"
        />

        //let videoButton = <LargeIconButton show={!this.props.currentCall && !this.state.caller} lable="Kontakt metode" subLable="Video" faIcon={faVideo} onClick={() => this.changeContactMethod()} />
        let components = [
            userDetails,
            //videoButton
        ];

      switch (true) {
          case this.props.currentCall !== null:
              components.push(<ChatButton key="chb" disconnect={this.props.disconnect} currentUser={this.props.currentUser} onSendMessage={this.props.sendMessage} messages={this.props.messages} currentCall={this.props.currentCall} />);
              break;

          case this.state.caller !== null:
              components.push(<Calling key="cab" reject={this.rejectCall} currentUser={this.props.currentUser} answer={this.answerCall} caller={this.state.caller} />)
              break;
          default:
              break;
        }
        return components;
  }
}
