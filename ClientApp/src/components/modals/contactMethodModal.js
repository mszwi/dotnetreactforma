import React, { Component } from 'react';
import { LargeIconButton } from '../LargeIconButton';
import { updateDetails } from '../signalRService';
import { Contact } from '../Contact';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { faVideo, faPhone, faComments } from '@fortawesome/free-solid-svg-icons';
import { OfflineMessage } from '../chat/OfflineMessage';
import { SettingsContext } from '../../SettingsContext';
import { contactMethodsText } from '../RenderHelpers';


export class ContactMethodModal extends Component {
    static displayName = ContactMethodModal.name;
    static contextType = SettingsContext;

  constructor(props) {
      super(props);
      this.updateContactMethod = this.updateContactMethod.bind(this);
      this.cancel = this.cancel.bind(this);

    this.state = {};
  }

    updateContactMethod(method) {
        let user = this.props.currentUser;
        user.contactMethod = Contact.contactMethods[method];
        updateDetails(this.props.connection, user);
        this.props.joinQueue();
    }

    cancel() {
        let user = this.props.currentUser;
        user.contactMethod = Contact.contactMethods['none'];
        user.contactSubject = Contact.contactTypes['none'];
        updateDetails(this.props.connection, user);
    }

    render() {

        let videoButton = this.context.contactMethods?.video && <LargeIconButton key="vb" onClick={() => { this.updateContactMethod('video') }} backgroundColor={this.context.farge} faIcon={faVideo} label={contactMethodsText(1)} show={true} />
        let phoneButton = this.context.contactMethods?.phone && <LargeIconButton key="pb" onClick={() => { this.updateContactMethod('phone') }} backgroundColor={this.context.farge} faIcon={faPhone} label={contactMethodsText(2)} subLabel="Vi kontakter deg" show={true} />
        let chatButton = this.context.contactMethods?.chat && <LargeIconButton key="cb" onClick={() => { this.updateContactMethod('chat') }} backgroundColor={this.context.farge} faIcon={faComments} label={contactMethodsText(3)} show={true} />
        let methodButtons = [videoButton, phoneButton, chatButton];
        let modalOpen = this.props.currentUser && this.props.currentUser.contactSubject !== 0 && this.props.currentUser.contactMethod === 0;

        return (
            <Modal isOpen={modalOpen} toggle={this.cancel} className="contact-method-modal">
                <ModalHeader toggle={this.cancel}>Velg kontakt metode</ModalHeader>
                <ModalBody>
                    <p>Velg hvordan du vil bli kontaktet ved &aring; klikke p&aring; en av de tre knappene nedenfor. Du vil stilles i k&oslash; og blir kontaktet innen kort tid.</p>
                    {this.props.queueStatus ? <div className="contact-buttons">{methodButtons}</div> : <OfflineMessage />}
                </ModalBody>
            </Modal>
    );
  }
}
