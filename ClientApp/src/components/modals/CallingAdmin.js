import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faComments, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

export class AdminCalling extends Component {
    static displayName = AdminCalling.name;

    constructor(props) {
        super(props);
        this.state = {currentTime: moment()};
        this.completeCall = this.completeCall.bind(this);
        this.connectChat = this.connectChat.bind(this);
        this.connectedAt = moment();
    }

    componentDidMount() {
       this.interval = setInterval(() => { this.setState({ currentTime: moment() }) }, 10)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    callType() {
        
        switch (this.props.currentlyCalling?.user?.contactMethod) {
            case 1:
                return (
                        <div>
                            <p>Attempting to connect to {this.props.currentlyCalling?.user?.displayName} via Video</p>
                        </div>
                        )
            case 2:
                return (
                        <div>
                            <p>{this.props.currentlyCalling?.user?.displayName} er n&aring; satt til "Opptatt" i k&oslash; mens du pr&oslash;ve &aring; ringer.</p>
                            <p>Hvis ikke du f&aring;r tak i de, kan du helle pr&oslash;ver &aring; sender en melding.</p>
                            <p>N&aring;r du er ferdig med samtale, kan du trykk p&aring; Complete.</p>
                        </div>
                        )
            case 3: return "Chat"
            default: return null;
            }
    }

    completeCall() {
        // console.log(this.props.currentlyCalling);
        this.props.connection.invoke("DisconnectAdmin", this.props.currentlyCalling.user.id);
   
    }

    connectChat() {
        this.props.connection.invoke("ForceAnswer", this.props.currentlyCalling.user.id);
    }
    

    render() {
        // console.log(this.props.currentlyCalling);
        if (!this.props.currentlyCalling ) {
            return null;
        }

        let timeSinceConnected = moment.duration(this.state.currentTime.diff(this.connectedAt));

        return (
            <Modal isOpen={this.props.currentlyCalling?.callStatus === 1} toggle={this.toggle} className="calling-user-modal">
                <ModalHeader toggle={this.toggle}><span>Calling ({timeSinceConnected.seconds()}s)</span></ModalHeader>
                <ModalBody>
                  {this.callType()}
                </ModalBody>

                <ModalFooter>
                    {this.props.currentlyCalling?.user?.contactMethod === 2 &&
                        <Button color="warning" onClick={this.connectChat}><FontAwesomeIcon icon={faComments} /> Send melding </Button>
                    }
                    {this.props.currentlyCalling?.user?.contactMethod === 2 &&
                        <Button color="primary" tag="a" target="hidden-iframe" href={`tel:${this.props.currentlyCalling?.user?.phoneNumber}`}><FontAwesomeIcon icon={faPhone} /> Call </Button>
                    }
                    {this.props.currentlyCalling?.user?.contactMethod === 2 &&
                        <Button color="success" onClick={this.completeCall}><FontAwesomeIcon icon={faCheck} /> Complete </Button>
                    }
                    <Button onClick={this.props.cancelCall} color="danger"><FontAwesomeIcon icon={faTimes} /> Cancel</Button>
                    <iframe title="Call Client" name="hidden-iframe" style={{ visibility: 'hidden', position: 'absolute'}}></iframe>

                </ModalFooter>

            </Modal>
        );
    }
}
