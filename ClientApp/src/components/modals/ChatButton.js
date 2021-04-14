import React, { Component } from 'react';
import { Messages } from '../chat/Messages';
import { Button, InputGroupAddon, ModalFooter, Modal, ModalHeader, ModalBody, InputGroup, Input } from 'reactstrap';
import { LargeIconButton } from '../LargeIconButton';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import anime from 'animejs';

export class ChatButton extends Component {
    static displayName = ChatButton.name;

    constructor(props) {
        super(props);
        this.state = { currentMessage: '', modalOpen: false };
        this.sendMessage = this.sendMessage.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.toggle = this.toggle.bind(this);
        // console.log(this.props.currentCall);
    }

    sendMessage() {
        this.props.onSendMessage(this.props.currentCall.adminId, this.state.currentMessage);
        this.setState({ currentMessage: '' });
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log('New Message', prevProps.messages.length, this.props.messages.length);

        if (prevProps !== undefined && prevProps.messages.length !== this.props.messages.length) {
            this.setState({ modalOpen: true });
            anime({
                targets: '.chat-button svg',
                duration: 200,
                scale: [1, 2],
                easing: 'easeOutQuad',
                loop: 1,
                direction: 'alternate',
            });
        }
    }

    keyUp(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    }

    toggle() {
        this.setState({ modalOpen: !this.state.modalOpen })
    }

    render() {
        if (!this.props.currentCall) {
            return null;
        }
        let label = `In Call
                Messages`;
        return (
            <span>
                <LargeIconButton className="chat-button green" onClick={() => this.toggle()} label={label} subLabel={this.props.messages?.length} faIcon={faComments} />
                <Modal isOpen={this.state.modalOpen} toggle={this.toggle} className="chat-modal">
                    <ModalHeader charCode="_" toggle={this.toggle}>Chatting with {this.props.currentCall.adminDisplayName}</ModalHeader>
                    <ModalBody>

                        

                        <Messages currentUser={this.props.currentUser} connection={this.props.currentCall} messages={this.props.messages} />

                        <InputGroup>

                            <Input tag="textarea" onKeyUp={this.keyUp} className="form-control" value={this.state.currentMessage} onChange={(e) => { this.setState({ currentMessage: e.target.value }) }} />
                            <InputGroupAddon addonType="append"><Button color="primary" onClick={this.sendMessage}>Send</Button></InputGroupAddon>

                        </InputGroup>

                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.props.disconnect}>Disconnect</Button>

                    </ModalFooter>
                </Modal>
                
            </span>
        );
    }
}
