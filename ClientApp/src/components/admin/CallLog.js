import React, { Component } from 'react';
import { LargeIconButton } from '../LargeIconButton';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem, ListGroupItemHeading } from 'reactstrap';
import { contactMethodsIcon } from '../RenderHelpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class CallLog extends Component {
    static displayName = CallLog.name;
    static CallLogType = [
        'Attempted by admin', 'Cancelled by admin', 'Cancelled by user', 'Answered by user', 'Disconnected by admin', 'Connected by Admin', 'Disconnected by User'
    ]

    constructor(props) {

    super(props);
      this.state = { modalOpen: false };
      this.countCallsToday = this.countCallsToday.bind(this);
      this.toggle = this.toggle.bind(this);
      this.renderLogs = this.renderLogs.bind(this);
        this.getTodaysCalls = this.getTodaysCalls.bind(this);
    }

    countCallsToday() {
        let count = this.getTodaysCalls()

            .reduce((subTotal, logItem) => {
           
            //if (logItem.admin?.id !== this.props.currentUser?.id ) {
            //    return subTotal;
            //}

            if (logItem.eventType === 3) {
                return subTotal + 1;
            }

            if (logItem.callType === 2 && (logItem.eventType === 5 || logItem.eventType === 4)) {
                return subTotal + 1;
            }

            return subTotal;
        }, 0);

        return count;
    }

    toggle() {
        this.setState((state, props) => ({ modalOpen: !state.modalOpen }) );
    }

    getTodaysCalls() {
        return this.props.callLog.filter(logItem => moment(logItem.eventTime).isBetween(moment().startOf('day'), moment().endOf('day')));
    }

    renderLogs() {
        let myLogs = this.getTodaysCalls().filter(logItem => logItem.admin?.id === this.props.currentUser?.id);
        return myLogs.map(logItem => {
            return (
                <ListGroupItem key={logItem.callLogId}>
                    <span><FontAwesomeIcon icon={contactMethodsIcon(logItem.callType)} /></span>
                    <span>{moment(logItem.eventTime).format('DD.MM.YYYY HH:mm:ss')}</span>
                    <span>{logItem.user.displayName || logItem.user.id}</span>
                    <span>{logItem.user.email}</span>
                    <span>{CallLog.CallLogType[logItem.eventType]}</span>
                </ListGroupItem>
            );
        });
    }

  render() {
    return (
        <span>

            <LargeIconButton onClick={this.toggle} faIcon={faChartLine} label="Calls today:" subLabel={this.countCallsToday()} />

            <Modal isOpen={this.state.modalOpen} toggle={this.toggle} className="call-log-modal">
                <ModalHeader toggle={this.toggle}>Call Log</ModalHeader>
                <ModalBody>
                    <ListGroup className="call-log">
                        <ListGroupItemHeading key="heading">
                            <span>Type</span>
                            <span>Date</span>
                            <span>User Name</span>
                            <span>User Email</span>
                            <span>Event</span>
                        </ListGroupItemHeading>

                        {this.renderLogs()}
                     </ListGroup>
                </ModalBody>

                <ModalFooter>
                  
                </ModalFooter>

            </Modal>
      </span>
    );
  }
}
