import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

export class Calling extends Component {
    static displayName = Calling.name;

    constructor(props) {
        super(props);
        this.state = {};
        this.callType = this.callType.bind(this);
        this.checkWherebyLink = this.checkWherebyLink.bind(this);
    }

    componentWillReceiveProps(prevProps) {
        console.log(prevProps.caller);
        console.log(this.props.caller);
    }

    callType() {
        // console.log(this.props.caller)
        switch (this.props.caller.contactMethod) {
            case 1:
                return (
                    <div>
                        <p>{this.props.caller?.adminDisplayName} klar for videosamtale via Whereby.com</p>
                        <p>Tykk p&aring; "Svar" for &aring; for &aring; bli med i samtalen. Et nytt vindu vil &aring;pnes..</p>
                    </div>
                )
            case 2:
                return (
                    <div>
                        <p>{this.props.caller?.adminDisplayName} vil straks ringe deg p&aring; {this.props.currentUser.phoneNumber}.</p>
                        <p>Vennligst ha telefonen klar. Hvis det ikke passer n&aring;, kan du trykke p&aring; knappen "Avbryt"</p>
                    </div>
                )
            case 3: return "Chat"
            default: return null;
        }

    }

    checkWherebyLink() {
        let connectionString;
        if (this.props.caller.wherebyLink !== null && this.props.caller.wherebyLink !== undefined && this.props.caller.wherebyLink.includes('http')) {
            connectionString = this.props.caller.wherebyLink;
        } else {
            connectionString = 'https://' + this.props.caller.wherebyLink;
        }
        return connectionString;
    }

    render() {
        
        return (
            <Modal isOpen={this.props.calling !== null} toggle={this.toggle} className="user-details-modal">
                <ModalHeader toggle={this.toggle}>Calling</ModalHeader>
                <ModalBody>
                    {this.callType()}
                    <p>Hvis tilkoblingen mislykkes, kan du ta kontakt via en av de andre kontaktmetodene nedenfor.</p>
                    <ListGroup>
                        <ListGroupItem><a href={`tel:${this.props.caller.adminPhone}`}><FontAwesomeIcon icon={faPhone} /> {this.props.caller.adminPhone} </a></ListGroupItem>
                        <ListGroupItem><a href={`mailto:${this.props.caller.adminEmail}`}><FontAwesomeIcon icon={faEnvelope} /> {this.props.caller.adminEmail} </a></ListGroupItem>
                    </ListGroup>
                </ModalBody>

                <ModalFooter>
                    <Button color="danger" onClick={this.props.reject}>Avbryt</Button>
                    {this.props.caller?.contactMethod === 2 && <Button color="success" onClick={this.props.answer}>Ok</Button>}
                    {this.props.caller?.contactMethod === 1 && <Button target="_blank" tag="a" href={this.checkWherebyLink()} color="primary" onClick={this.props.answer} >Svar</Button>}
                </ModalFooter>

            </Modal>
        );
    }
}
