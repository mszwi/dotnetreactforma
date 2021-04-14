import React, { Component } from 'react';
import { LargeIconButton } from './LargeIconButton';
import { faComments, faTools } from '@fortawesome/free-solid-svg-icons';
import { SettingsContext } from '../SettingsContext';
import { updateDetails } from './signalRService';
import { Contact } from './Contact';

export class ContactSubjectButtons extends Component {
    static displayName = ContactSubjectButtons.name;
    static contextType = SettingsContext;

  constructor(props) {
    super(props);
    this.updateSubject = this.updateSubject.bind(this);
      this.state = {};
    }

    updateSubject(type) {
        let user = this.props.currentUser;
        user.contactSubject = Contact.contactTypes[type];
        updateDetails(this.props.connection, user);
       
    }

    render() {
        let show = this.props.currentUser?.contactMethod === 0 || this.props.currentUser?.contactSubject === 0;
        let expertButton = <LargeIconButton key="tk-bt" onClick={() => this.updateSubject('technicalSupport')} backgroundColor={this.context.farge} faIcon={faComments} label="Kontakt selger N&Aring;" subLabel="-gj&oslash;r en god deal!" show={show} />;
        let supportButton = <LargeIconButton key="cs-bt" onClick={() => this.updateSubject('customerService')} backgroundColor={this.context.farge} faIcon={faTools} label="Teknisk support" subLabel="-vi hjelper deg!" show={show} />;

        let buttons = [expertButton, supportButton];
        return buttons;
  }
}
