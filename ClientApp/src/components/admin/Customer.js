import React, { Component } from 'react';
import { ListGroupItem, Button, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faComment, faPhone } from '@fortawesome/free-solid-svg-icons';

export class Customer extends Component {
    static displayName = Customer.name;

    constructor(props) {
        super(props);
        this.state = {};
        // console.log(this.props.customer);
        this.renderSubject = this.renderSubject.bind(this)
    }
    renderSubject() {
        switch (this.props.customer.user.contactSubject) {
            case 0:
                return <span>Not Selected</span>
            case 1:
                return <span>Teknisk support</span>
            case 2:
                return <span>Produkt expert</span>
            default: return null;
        }
    }

    render() {
        let contactIcon;
        if (this.props.customer.user?.contactMethod === 1) {
            contactIcon = <FontAwesomeIcon icon={faVideo} />
        } else if (this.props.customer.user?.contactMethod === 2) {
            contactIcon = <FontAwesomeIcon icon={faPhone} />
        } else if (this.props.customer.user?.contactMethod === 3) {
            contactIcon = <FontAwesomeIcon icon={faComment} />
        }

        if (this.props.customer === undefined) {
            return null;
        }
        let inCall = (this.props.customer.callStatus !== 0 && this.props.customer.connectedAdmin !== null);
        let disabled = this.props.currentUser.status !== 0 || inCall;

        return (
            
            <ListGroupItem className="customer justify-content-between" >
                <span><Badge pill>{this.props.position}</Badge> {this.props.customer.user?.displayName || 'Uten Navn'}</span>
                <span>{this.props.customer.user.email}</span>
                <span>{this.renderSubject()}</span>

                <span>
                    {!inCall && <Button disabled={disabled} color="danger" className="delete-button" onClick={() => this.props.deleteCallback(this.props.customer.user)}>Delete</Button>
                    }
                    {!inCall && <Button
                        disabled={disabled}
                        color="primary"
                        className="connect-button"
                        onClick={() => this.props.callClient(this.props.customer.user)}>{contactIcon} Connect
                    </Button>}
                    {inCall && <span>Connected to {this.props.customer.connectedAdmin.displayName}</span>}
                </span>

            </ListGroupItem>
        );
    }
}
