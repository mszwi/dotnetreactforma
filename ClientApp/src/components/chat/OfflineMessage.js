import React, { Component } from 'react';
import { SettingsContext } from '../../SettingsContext';


export class OfflineMessage extends Component {
    static displayName = OfflineMessage.name;
    static contextType = SettingsContext;

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <section  className="queue-section">
            <div className="offline-message" dangerouslySetInnerHTML={{ __html: this.context.offlineTekst }} />
        </section>
    );
  }
}
