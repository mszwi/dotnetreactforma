import React, { Component } from 'react';
import { Messages } from './Messages';
import { Button, Col, Row, InputGroupAddon, InputGroup, Input } from 'reactstrap';

export class ChatSection extends Component {
    static displayName = ChatSection.name;

    constructor(props) {
        super(props);
        this.state = { currentMessage: '' };
        this.sendMessage = this.sendMessage.bind(this);
        this.keyUp = this.keyUp.bind(this);
    }

    sendMessage() {
        this.props.onSendMessage(this.props.currentCall.user.id, this.state.currentMessage);
        this.setState({ currentMessage: '' });
    }

    keyUp(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    }

    render() {
        if (!this.props.currentCall) {
            return null;
        }

        return (
            <section className="chat-section">
               
                <h1>You are connected with {this.props.currentCall.user?.displayName}</h1>
               
                
                <Row>
                    <Col xs="12">
                        <Messages currentUser={this.props.currentUser} connection={this.props.currentCall} messages={this.props.messages} />
                    </Col>
                </Row>

                <Row>
                    <Col xs="12">
                        <InputGroup>
                            <Input tag="textarea" onKeyUp={this.keyUp} className="form-control" value={this.state.currentMessage} onChange={(e) => { this.setState({ currentMessage: e.target.value }) }} />
                            <InputGroupAddon addonType="append"><Button color="primary" onClick={this.sendMessage}>Send</Button></InputGroupAddon>

                        </InputGroup>
                    </Col>
                </Row>
            </section>
        );
    }
}
