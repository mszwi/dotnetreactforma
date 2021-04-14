import React, { Component } from 'react';
import { LargeIconButton } from '../LargeIconButton';
import { faClock, faVideo, faPhone, faComments } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { contactMethodsText } from '../RenderHelpers';
import { updateDetails } from '../signalRService';
import { Contact } from '../Contact';
import { SettingsContext } from '../../SettingsContext';

export class QueuePosition extends Component {
    static displayName = QueuePosition.name;
    static contextType = SettingsContext;

    constructor(props) {
        super(props);
        this.state = { isOpen: false, leaveQueueOpen: false }
        this.toggle = this.toggle.bind(this);
        this.toggleLeaveQueue = this.toggleLeaveQueue.bind(this);
        this.exitQueue = this.exitQueue.bind(this);
        this.closeAll = this.closeAll.bind(this);
        this.updateContactMethod = this.updateContactMethod.bind(this);

    }

    componentDidUpdate(prevProps) {
        if (prevProps.queuePosition === -1 && this.props.queuePosition !== -1) {
            this.setState({ isOpen: true });
        }
    }

    toggle() {
        this.setState((state) => ({
            isOpen: !state.isOpen
            })
        );
    }

    closeAll() {
        this.setState({ leaveQueueOpen: false, isOpen: false });
    }

    toggleLeaveQueue() {
        this.setState((state) => ({
            leaveQueueOpen: !state.leaveQueueOpen
        })
        );
    }

    exitQueue() {
        this.setState({ isOpen: false, leaveQueueOpen: false });

        setTimeout(() => {
            this.props.connection.invoke("LeaveQueue", this.props.currentUser.id).catch(function (err) {
                return console.error(err.toString());
            });
        }, 500)
        
    }


    updateContactMethod(method) {
        let user = this.props.currentUser;
        user.contactMethod = Contact.contactMethods[method];
        updateDetails(this.props.connection, user);
    }

    render() {
        // console.log("Queue Position:" + this.props.queuePosition)
        if (this.props.hide) {
            return null;
        }

        let label = this.props.queuePosition === 0 ? "Du er neste i k\u00f8" : `Du er nummer ${this.props.queuePosition} i k\u00f8`;
        let className = this.props.queuePosition > 5 ? "orange" : this.props.queuePosition === 0 ? "green" : `yellow`;
        let subLabel = "-Klikk for mer info";
        //if (this.props.queuePosition === null) {
        //    return <button className="join-queue" onClick={this.props.joinQueue} >Join Queue</button>
        //}

        let videoClass = this.props.currentUser.contactMethod === 1 ? 'green' : '';
        let videoButton = this.context.contactMethods?.video &&  <LargeIconButton key="vb" className={videoClass} onClick={() => { this.updateContactMethod('video') }} faIcon={faVideo} label={contactMethodsText(1)} show={true} />

        let phoneClass = this.props.currentUser.contactMethod === 2 ? 'green' : '';
        let phoneButton = this.context.contactMethods?.phone &&  <LargeIconButton key="pb" className={phoneClass} onClick={() => { this.updateContactMethod('phone') }} backgroundColor={this.context.farge} faIcon={faPhone} subLabel="Vi kontakter deg" label={contactMethodsText(2)} show={true} />

        let chatClass = this.props.currentUser.contactMethod === 3 ? 'green' : '';
        let chatButton = this.context.contactMethods?.chat &&  <LargeIconButton key="cb" className={chatClass} onClick={() => { this.updateContactMethod('chat') }} backgroundColor={this.context.farge} faIcon={faComments} label={contactMethodsText(3)} show={true} />
        let methodButtons = [videoButton, phoneButton, chatButton];

        if (this.props.queuePosition >= 0) {
            return (<div>
                <LargeIconButton className={className} onClick={this.toggle} faIcon={faClock} label={label} subLabel={subLabel} />

                <Modal isOpen={this.state.isOpen && !this.state.leaveQueueOpen} toggle={this.toggle} className="queue-info-modal">
                    <ModalHeader toggle={this.toggle}>K&oslash; info</ModalHeader>
                    <ModalBody>
                        <h3>{label}</h3>
                        <p>Din &oslash;nsket kontakt metode er {contactMethodsText(this.props.currentUser.contactMethod)}</p>
                        {this.context.contactMethods?.video + this.context.contactMethods?.phone + this.context.contactMethods?.chat > 1 && <p>Klikk for &aring; endre</p>}
                        <div className="change-contact-buttons">{methodButtons}</div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={this.toggleLeaveQueue}>Forlat k&oslash;</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Lukk</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.leaveQueueOpen} toggle={this.toggleLeaveQueue} className="queue-info-modal">
                    <ModalHeader toggle={this.toggleLeaveQueue}>Forlat k&oslash;</ModalHeader>
                    <ModalBody>
                        <p>Er du sikker p&aring; at du vil forlate k&oslash;en?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.exitQueue}>Forlat k&oslash;</Button>{' '}
                        <Button color="secondary" onClick={this.closeAll}>Avbryt</Button>
                    </ModalFooter>
                </Modal>


            </div>);
        }

        //if (this.props.queuePosition === -1 && this.props.currentUser && this.props.currentUser.contactMethod && this.props.currentUser.contactSubject) {
        //    this.props.joinQueue();
        //    return (
        //    <Toast>
        //            <ToastHeader>
        //            Reactstrap
        //            </ToastHeader>
        //            <ToastBody>
        //                        Joining Queue
        //            </ToastBody>
        //        </Toast>)
        //}

        return null;

       
    }
}
