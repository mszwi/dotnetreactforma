import React, { Component } from 'react';
import { faShoppingCart, faComments, faTools} from '@fortawesome/free-solid-svg-icons';
import { LargeIconButton } from './LargeIconButton';
import { QueuePosition } from './chat/QueuePosition';
import * as signalR from '@microsoft/signalr';
import { ContactMethodModal } from './modals/contactMethodModal';
import { InCall } from './chat/InCall';
import { SettingsContext } from '../SettingsContext';
import { Spinner } from 'reactstrap';
import { updateDetails } from './signalRService';
import { ButtonsContainer } from './ButtonsContainer';
import { CompetitionList } from './modals/CompetitionList';

export class Contact extends Component {
    static displayName = Contact.name;
    static contextType = SettingsContext;

    static contactMethods = {
        none: 0,video: 1, phone: 2, chat: 3
    }
    static contactTypes = {
       none: 0, technicalSupport: 1, customerService: 2,
    }

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.connectionListners = this.connectionListners.bind(this);
        this.updateQueue = this.updateQueue.bind(this);
        this.joinQueue = this.joinQueue.bind(this);
        this.closeChat = this.closeChat.bind(this);
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
        this.loginCallback = this.loginCallback.bind(this);
        this.addToGroup = this.addToGroup.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.updateSubject = this.updateSubject.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.state = {
            currentUser: null,
            showLoginModal: false,
            isAuthenticated: false,
            queueStatus: 0,
            token: '',
            queuePosition: -1,
            connected: false,
            calling: null,
            activeChatWindow: null,
            currentCall: null,
            messages: [],
            errorCount: 0
        }

        this.destroy = this.destroy.bind(this);
    }


    componentWillUnmount() {
        this.connection.stop();
    }

    async getNewUser() {
        try {
            const response = await fetch('/Messa/CreateAnonymousUser', {
                headers: {},
            });
            // console.log(response);

            return await response.json();
        }
        catch (e) {
            console.error(e);
            return Promise.reject(e);
        }        
    }

    async ensureUserPresent() {
        let userstring = localStorage.getItem('applicationUser');
        let user = JSON.parse(userstring);
        let token = localStorage.getItem('applicationUserToken');
        if (token !== null) {
            this.setState({ token: token });
        }

        if (user !== null) {
            this.setState({ currentUser: user });
            return Promise.resolve(user);

        } else {
            let newUser = await this.getNewUser();
            localStorage.setItem('applicationUser',JSON.stringify(newUser));

            this.setState({ currentUser: newUser });
            return newUser;
        }

    }

    clearStorage() {
        localStorage.clear();
    }

    async componentDidMount() {
        //authService.isAuthenticated().then(res => {
        //    // console.log(res);
        //        this.setState({ isAuthenticated: res })
        //});
        //try {
        //    const response = await fetch('/Messa/CreateAnonymousUser', {
        //        headers: {},
        //    });
        //    // console.log(response);

        //    let data = await response.json();


        //    this.setState({ currentUser: data });
        //    this.connect();
        //}
        //catch (e) {
        //    console.error(e);
        //}            
      

        window.addEventListener('beforeunload', (event) => {
            this.connection.stop();
        });

        await this.ensureUserPresent();
        
        this.connect();


    }


    toggle() {
        this.setState({ modalOpen: !this.state.modalOpen });
    }

    closeChat() {
        this.connection.invoke("DisconnectAdmin", this.state.currentConnection.Key).catch(function (err) {
            return console.error(err.toString());
        });
    }



    connect() {

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();

        this.connectionListners();

        this.connection.start()
            .then(
                () => {
                    // console.log("Connected to Chat hub");
                    this.setState({ connected: true });
                    this.addToGroup();
                },
                () => {
                    this.setState({ connected: false });
                    setTimeout(() => {
                        "Disconnected... Atempting to reconnect";
                        this.connect();
                    }, 5000);
                }
        );

        this.connection.onreconnecting(error => {
            console.log("Attempting to reconnect")

            this.setState({ connected: false });

        });

        //this.getMainStream();
        //this.updateQueue();
    }

    connectionListners() {

        this.connection.on("Token", data => {
            // console.log(data);
            this.setState({ token: data });
            localStorage.setItem('Token', data);
        });


        this.connection.on("send", data => {
            // console.log(data);
        });

        this.connection.on("YourPosition", data => {
            /* if (data === -1) {
                 this.setState({ queuePosition: data, contactMethod: 0, contactSubject: 0 })
             }
             else {
                 */
            this.setState({ queuePosition: data });
        
            });


        this.connection.on("QueueStatus", data => {
            // console.log(data);
            this.setState({ queueStatus: data });
        });

        this.connection.on("QueueLengthUpdate", data => {
            // console.log(data);
            this.setState({ queueLength: data });
        });


        this.connection.on("MainStreamUpdate", data => {
            // console.log(data);
            this.setState({ mainStream: data });
        });

        this.connection.on("Answer", data => {
            this.setState({ currentCall: data });
        });


        this.connection.on("YourStatus", data => {
            localStorage.setItem('applicationUser', JSON.stringify(data));

            let state = { currentUser: data};
            this.setState(state);
        });

        this.connection.on("Error", data => {
            console.error(data);
            this.setState((state) => ({ errorCount: state.errorCount + 1 }));
            if (this.state.errorCount > 3 && !localStorage.getItem('triedReload')) {
                localStorage.clear();
                localStorage.setItem('triedReload', true);
                window.location.reload();
            }
           
        });

        this.connection.on("Disconnect", data => {
            this.destroy();
        });

        this.connection.on("ReceiveMessage", data => {
            // console.log(data);

            let messages = [...this.state.messages, data];
            this.setState({ messages });
        });

        this.connection.on("Messages", data => {
            // console.log(data);
            this.setState({ messages:data });
        });

    }

    updateQueue() {
        this.connection.invoke("GetQueueUpdate").catch(function (err) {
            return console.error(err.toString());
        });
    }

    getMainStream() {
        this.connection.invoke('GetMainStream').catch(function (err) {
            return console.error(err.toString());
        });;
    }

    addToGroup() {
        let currentUser = this.state.currentUser;
        this.connection.invoke("AddUserToGroup", currentUser).catch(function (err) {
            return console.error(err.toString());
        });
    }

    joinQueue() {
        this.connection.invoke("JoinQueue", this.state.currentUser).catch(function (err) {
            return console.error(err.toString());
        });
    }



    loginCallback() {
        // console.log('loggin-in');
        //let userManager = new UserManager();

        //userManager.
        //authService.signIn({});

        this.connection.invoke("CreateAnonymousUser").catch(function (err) {
            return console.error(err.toString());
        });

        this.toggleLoginModal();
    }

    toggleLoginModal() {
        this.setState({ showLoginModal: !this.state.showLoginModal });
    }

    sendMessage(userId, message) {
        this.connection.invoke("SendPrivateMessage", this.state.currentUser.id, userId, message).catch(function (err) {
            return console.error(err.toString());
        });

    }

    destroy() {
        /*this.connection.invoke("RemoveSelfFromGroup").catch(function (err) {
            return console.error(err.toString());
        });*/
        // console.log("Received disconnect request from server");

        // console.log(this.state.activeChatWindow);
        if (this.state.activeChatWindow !== undefined && this.state.activeChatWindow !== null) {
            this.state.activeChatWindow.close();
        }

        this.setState({ currentConnection: null, currentCall: null, calling: null, messages: [], activeChatWindow: null })
    }


    disconnect() {
        // console.log(this.props.currentCall);
        this.connection.invoke("DisconnectUser", this.state.currentUser).catch(function (err) {
            return console.error(err.toString());
        });

    }

    updateSubject(type) {
        let user = this.state.currentUser;
        user.contactSubject = Contact.contactTypes[type];
        updateDetails(this.connection, user);
    }


    render() {
        if (!this.connection) {
            return <Spinner />;
        }
        let showContactButtons = this.state.currentUser?.contactMethod === 0 || this.state.currentUser?.contactSubject === 0;

        let showExpertButton = showContactButtons && this.context.kontaktSelger?.visKontaktknappSelger;
        let disableExpertButton = this.context.kontaktSelger?.deaktiverKontaktknappSelger;
        let expertButton = <LargeIconButton disabled={disableExpertButton} key="tk-bt" onClick={() => this.updateSubject('customerService')} className="contact-button" faIcon={faComments} label={this.context.kontaktSelger?.tekstlinje1PaaKnappSelger} subLabel={this.context.kontaktSelger?.tekstlinje2PaaKnappSelger} show={showExpertButton} />;

        let showSupportButton = showContactButtons && this.context.kontaktSupport?.visKontaktknappSupport;
        let disableSupportButton = this.context.kontaktSupport?.deaktiverKontaktknappSupport;
        let supportButton = <LargeIconButton disabled={disableSupportButton} key="cs-bt" onClick={() => this.updateSubject('technicalSupport')} className="contact-button" faIcon={faTools} label={this.context.kontaktSupport?.tekstlinje1PaaKnappSupport} subLabel={this.context.kontaktSupport?.tekstlinje2PaaKnappSupport} show={showSupportButton} />;

        let showMessaButton = this.context.messebutikk?.visNettbutikklink;
        let disableMessaButton = this.context.messebutikk?.deaktiverNettbutikklink;

        let showCompButton = this.context.konkurranse?.visKonkurranseknapp;
        let disableCompButton = this.context.konkurranse?.deaktiverKonkurransekknapp;
        let compButton = <CompetitionList connection={this.connection} label={this.context.konkurranse?.konkurranseHeader} subLabel={this.context.konkurranse?.konkurranseText} disabled={disableCompButton} show={showCompButton} key="cp" competitionId={1} currentUser={this.state.currentUser} />;
        return (
            <ButtonsContainer className="contact-buttons" >
                {compButton}
                {expertButton}
                {!this.state.currentCall && <QueuePosition currentUser={this.state.currentUser} connection={this.connection} queuePosition={this.state.queuePosition} />}
               
                {supportButton}
                <ContactMethodModal queueStatus={this.state.queueStatus} joinQueue={this.joinQueue}  connection={this.connection} currentUser={this.state.currentUser} />

                <InCall disconnect={this.disconnect} sendMessage={this.sendMessage} messages={this.state.messages} currentCall={this.state.currentCall} connection={this.connection} currentUser={this.state.currentUser} />
                <LargeIconButton className="shop-button" href={!disableMessaButton ? "https://messe.fomanettbutikk.no/" : null} disabled={disableMessaButton} backgroundColor={this.context.farge} faIcon={faShoppingCart} label={this.context.messebutikk?.tekstlinje1PaaKnapp} subLabel={this.context.messebutikk?.tekstlinje2PaaKnapp} show={showMessaButton} />
            </ButtonsContainer>
        )
        }
    
}
