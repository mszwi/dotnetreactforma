import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, InputGroup, Input, InputGroupAddon, InputGroupText, Spinner } from 'reactstrap';
import { faCheck, faExclamation, faPhone, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styleHelper from '../styleHelpers';
import { LargeIconButton } from '../LargeIconButton';
import { SettingsContext } from '../../SettingsContext';
import { Competition } from '../Competition';
import { updateDetails } from '../signalRService';
import { PhoneInput } from '../form/phoneInput';
import { EmailInput } from '../form/EmailInput';

export class CompetitionList extends Component {
    static displayName = CompetitionList.name;
    static contextType = SettingsContext;

    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            inputs: {
                phone: {
                    value: '',
                    valid: false,
                    validator: (value) => value !== '' && this.phoneValidation.test(value),
                    error: false
                },
                email: {
                    value: '',
                    valid: false,
                    validator: (value) => value !== '' && this.emailValidation.test(value),
                    error: false
                },
            },
            errors: [],
            entries:[],
            response: '',
            loading: false,
            selectedCompetition: null
        };
        this.joinCompetition = this.joinCompetition.bind(this);
        this.selectCompetition = this.selectCompetition.bind(this);
        this.getCompetitionEntries = this.getCompetitionEntries.bind(this);
        this.isValid = this.isValid.bind(this);
        this.updateValue = this.updateValue.bind(this);
        this.toggle = this.toggle.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.emailValidation = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
        this.phoneValidation = RegExp(/^(\+\d{1,3}[- ]?)?\d{6,}$/);
        this.requestTimeout = null;
    }

    componentDidUpdate(prevProps) {

        if (this.props.currentUser && prevProps.currentUser !== this.props.currentUser) {
            let inputs = this.state.inputs;
            if (this.emailValidation.test(this.props.currentUser.email)) {
                this.updateValue('email', this.props.currentUser.email);
            }
            if (this.phoneValidation.test(this.props.currentUser.phoneNumber)) {
                this.updateValue('phone', this.props.currentUser.phoneNumber)
            }

            this.setState({ inputs })
        }
    }

    toggle() {
        this.setState({ modalOpen: !this.state.modalOpen })
    }

    joinCompetition(id) {
        if (!this.isValid()) {
            return;
        }
        this.setState({ error: '', loading: true });
        let user = this.props.currentUser;

        if (!user.email && this.state.inputs.email.valid) {
            user.email = this.state.inputs.email.value;
        }

        if (!user.phoneNumber && this.state.inputs.phone.valid) {
            user.phoneNumber = this.state.inputs.phone.value;
        }

        console.log("saving user details");
        updateDetails(this.props.connection, user);

        this.sendRequest(id);
    }

    async getCompetitionEntries() {
        const response = await fetch('Messa/CompetitionEntries', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ email: this.state.inputs.email.value, phoneNumber: this.state.inputs.phone.value}),
        });
        const data = await response.json();
        this.setState({entries: data})
        this.requestTimeout = null;

        //this.setState({ response: data.response, loading: false });
    }

    async sendRequest(id) {
        const response = await fetch('Messa/JoinCompetition', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
                email: this.state.inputs.email.value,
                phoneNumber: this.state.inputs.phone.value,
                userId: this.props.currentUser.id,
                competitionId: id
            }),
        });
        const data = await response.json();
        if (data.error) {
            return this.setState({ error: data.error, loading: false  })
        }

        let entries = [...this.state.entries, data];
        this.setState({ entries, loading: false, selectedCompetition: null });
    }

    updateValue(name, value) {
        if (this.requestTimeout !== null) {
            clearTimeout(this.requestTimeout);
        }

        this.requestTimeout = setTimeout(this.getCompetitionEntries, 500);

        let inputs = this.state.inputs;
        inputs[name].value = value;
        inputs[name].valid = inputs[name].validator(value);
        if (!inputs[name].valid) {
            inputs[name].error = `${name} is not valid`;
        } else {
            inputs[name].error = false;
        }
        let state = { inputs };

        this.setState(state);
    }

    isValid() {
        return this.state.inputs.phone.valid && this.state.inputs.email.valid;
    }

    selectCompetition(selectedCompetition) {
        this.setState({ selectedCompetition })
    }

    createCompetitionList() {
        if (!this.context.konkurranseList) {
            return [];
        }

        return this.context.konkurranseList.map(competition => {
            let hasEntered = this.state.entries.find(entry => entry.competitionId === competition.konkurranseId) !== undefined;
            return <Competition key={competition.konkurranseId} hasEntered={hasEntered} isValid={this.isValid() && !this.state.loading} isSelected={this.state.selectedCompetition === competition} competition={competition} {...this.props} selectCompetition={this.joinCompetition} />
        });
    }

    renderInputs() {
        if (this.state.loading) {
            return <Spinner color="primary" />
        }

        return (
            <div>

                <PhoneInput onChange={(e) => { this.updateValue('phone', e.target.value) }} value={this.state.inputs.phone.value} />
                <EmailInput onChange={(e) => { this.updateValue('email', e.target.value) }} value={this.state.inputs.email.value} />


            </div>
        );

    }

    render() {

        let modal = <Modal isOpen={this.state.modalOpen} toggle={this.toggle} className="competition-modal">
            <ModalHeader toggle={this.toggle}>Bli med i konkurransen!</ModalHeader>
            <ModalBody>
                <p>Fyll inn e-post og telefonnummer, og klikk p&aring; konkurransen du &oslash;nsker &aring; delta i. Du kan kun delta &eacute;n gang per konkurranse.</p>
                <p>Vinnerne vil bli offentliggjort under trekningen, og blir deretter kontaktet.</p>
                {this.renderInputs()}
                {this.createCompetitionList()}
                {this.state.error && <p>{this.state.errror}</p>}
            </ModalBody>


            <ModalFooter>
                <Button color="secondary" onClick={this.toggle}>Lukk</Button>
            </ModalFooter>

        </Modal>;

        let disabled = this.state.response !== '';
        return (
            <LargeIconButton
                disabled={disabled}
                style={styleHelper.lightBackground()}
                modal={modal} faIcon={faTrophy}
                className="competition-button"
                onClick={this.toggle}
                {...this.props}
            />
        );
    }
}
