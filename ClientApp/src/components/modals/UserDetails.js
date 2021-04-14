import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faUserEdit, faClock, faVideo } from '@fortawesome/free-solid-svg-icons';
import { Button, ListGroupItem, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { primaryBackground } from '../styleHelpers';
import { LargeIconButton } from '../LargeIconButton';
import { Contact } from '../Contact';
import { updateDetails } from '../signalRService';
import { EmailInput } from '../form/EmailInput';
import { PhoneInput } from '../form/phoneInput';

export class UserDetails extends Component {
    static displayName = UserDetails.name;

    constructor(props) {
        super(props);
        this.state = {
            nameInput: '',
            emailInput: '',
            phoneInput: '',
            wherebyInput: '',
            modalOpen: false,
            editing: true,
            phoneWarning: false
        };
        this.phoneValidation = RegExp(/^(\+\d{1,3}[- ]?)?\d{6,}$/);
        this.renderInputs = this.renderInputs.bind(this);
        this.renderDetails = this.renderDetails.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.nameChange = this.nameChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.save = this.save.bind(this);
        this.toggle = this.toggle.bind(this);
        this.leave = this.leave.bind(this);
    }

    componentDidMount() {
        this.setState({
            nameInput: this.props.user.displayName,
            emailInput: this.props.user.email,
            phoneInput: this.props.user.phoneNumber,
            wherebyInput: this.props.user.wherebyLink,
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            this.setState({
                nameInput: this.props.user.displayName,
                emailInput: this.props.user.email,
                phoneInput: this.props.user.phoneNumber,
                wherebyInput: this.props.user.wherebyLink,
            });
        }

        if (this.props.user.contactMethod === Contact.contactMethods.phone && !this.phoneValidation.test(this.props.user.phoneNumber) && !this.state.modalOpen) {
            this.setState({ modalOpen: true });
        }
    }

    emailChange(emailInput) {
        this.setState({ emailInput });
    }

    nameChange(nameInput) {
        this.setState({ nameInput });

    }

    phoneChange(phoneInput) {
        this.setState({ phoneInput });

    }
    wherebyChange(wherebyInput) {
        this.setState({ wherebyInput });

    }



    save() {
        let state = { editing: false };
        if (this.props.user.contactMethod === Contact.contactMethods.phone && !this.phoneValidation.test(this.state.phoneInput)) {
            this.setState({phoneWarning: true});
            return;
        } else {
            state.phoneWarning = false;
        }

        if (this.props.connection !== undefined) {
            let user = this.props.user;
            user.displayName = this.state.nameInput;
            user.email = this.state.emailInput;
            user.phoneNumber = this.state.phoneInput;
            if (user.type === 0) {
                user.wherebyLink = this.state.wherebyInput;
                this.props.connection.invoke("UpdateAdminDetails", user).catch(function (err) {
                    return console.error(err.toString());
                });
            } else {
                this.props.connection.invoke("UpdateDetails", user).catch(function (err) {
                    return console.error(err.toString());
                });
            }

            this.setState(state);
        }
    }

    renderInputs() {
        let inputs = [];

        if (this.props.user !== undefined) {

            inputs.push(
                <div className="input-group" key="dni">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroup-sizing-default">Navn</span>
                    </div>
                    <input className="form-control" id="display-name-input" value={this.state.nameInput || ''} onChange={(e) => { this.nameChange(e.target.value); }} />
                </div>
            );


            inputs.push(
                <EmailInput key="ei" onChange={(e) => { this.emailChange( e.target.value) }} value={this.state.emailInput || ''} />
            );

            inputs.push(
                <PhoneInput key="pi" onChange={(e) => { this.phoneChange(e.target.value) }} value={this.state.phoneInput || ''} />
            );

            if (this.props.user.type === 0) {
                inputs.push(
                    <div className="input-group" key="wb">
                        <div className="input-group-prepend">
                            <a href="https://whereby.com/user" target="_blank" rel="noopener noreferrer" className="input-group-text" id="inputGroup-sizing-default">Whereby</a>
                        </div>
                        <input className="form-control" id="whereby-input" value={this.state.wherebyInput || ''} onChange={(e) => { this.wherebyChange(e.target.value); }} />
                    </div>
                );
            }
        }

        return inputs;
    }

    renderDetails() {
        let lines = [];
        lines.push(
            <ListGroupItem key="lidn"><FontAwesomeIcon icon={faUserEdit} />{this.props.user.displayName}</ListGroupItem>
        );
        lines.push(
            <ListGroupItem key="liue"><FontAwesomeIcon icon={faEnvelope} />{this.props.user.email}</ListGroupItem>
        );
        lines.push(
            <ListGroupItem key="liup"> <FontAwesomeIcon icon={faPhone} />{this.props.user.phoneNumber}</ListGroupItem>
        );

        if (this.props.user.type === 0) {
            lines.push(
                <ListGroupItem key="wbqp"> <FontAwesomeIcon icon={faVideo} />{this.props.user.wherebyLink}</ListGroupItem>
            );
        }

        if (this.props.user.type === 1 && this.props.queuePosition !== undefined) {
            lines.push(
                <ListGroupItem key="liqp"> <FontAwesomeIcon icon={faClock} />{this.props.queuePosition}</ListGroupItem>
            );
        }

        return lines;
    }

    toggle() {
        let state = { modalOpen: !this.state.modalOpen };
        if (this.props.user.contactMethod === Contact.contactMethods.phone && !this.phoneValidation.test(this.state.phoneInput)) {

            return this.setState({ phoneWarning: true });
        } else {
            state.phoneWarning = false;
        }
        this.setState(state);
    }

    leave() {
        let user = this.props.user;
        user.contactMethod = 0;
        user.contactSubject = 0;
        this.setState({ phoneWarning: false, modalOpen: false });

        this.props.connection.invoke("UpdateDetails", user).catch(function (err) {
            return console.error(err.toString());
        }).then(() => {
            this.props.connection.invoke("LeaveQueue", this.props.user.id).catch(function (err) {
                return console.error(err.toString());
            });
        });

        return;
    }

    render() {

        if (this.props.user.id === undefined) {
            return null;
        }

        let phoneValid = PhoneInput.validate.test(this.state.phoneInput);

        let modal = (<Modal isOpen={this.state.modalOpen} toggle={this.toggle} className="user-details-modal">
            <ModalHeader toggle={this.toggle}>Din info</ModalHeader>
            <ModalBody>
                {this.props.user.contactMethod === Contact.contactMethods.phone && <p style={{ color: phoneValid ? 'green' : 'red' }}>Telefonnummer er et p&aring;krevd felt n&aring;r du har valgt &aring; bli kontaktet per telefon. Skriv inn ditt telefonnummer og klikk "Lagre".</p> }
                {!phoneValid && <p style={{ color: 'red' }}>Telefon er ikke gyldig!</p> }
                {this.state.editing ? this.renderInputs() : this.renderDetails()}
            </ModalBody>

            <ModalFooter>
                {
                    this.state.editing ?
                        <Button color="primary" onClick={this.save}>Lagre</Button> :
                        <Button color="primary" onClick={() => this.setState({ editing: true })} >Endre</Button>
                }
                {this.state.phoneWarning ? <Button color="danger" onClick={this.leave}>Forlat k&oslash;</Button> :
                    <Button color="secondary" onClick={this.toggle}>Lukk</Button>}
            </ModalFooter>

        </Modal>)

        return (
            <LargeIconButton className={this.props.className} faIcon={faUserEdit} onClick={this.toggle} backgroundColor={primaryBackground()} show={true} label="Din info" subLabel="-Klikk for &aring; endre" modal={modal} />
        );
    }
}
