import React, { Component } from 'react';
import { UserDetails } from '../modals/UserDetails';
import { ListGroup, Col, Row, Button, ListGroupItem } from 'reactstrap';
import { faPlug, faEye, faEyeSlash, faSignal, faSignOutAlt, faHandshake, faUsers, faPhone } from '@fortawesome/free-solid-svg-icons';
import { ChatSection } from '../chat/ChatSection';
import authService from '../api-authorization/AuthorizeService';
import * as signalR from '@microsoft/signalr';
import { AdminCalling } from '../modals/CallingAdmin';
import { AdminList } from './AdminList';
import { ClientList } from './ClientList';
import { LargeIconButton } from '../LargeIconButton';
import { CallLog } from './CallLog';
import { Contact } from '../Contact';
import { Layout } from '../Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            clientList: [],
            adminList: [],
            displayName: '',
            displayNameInput: '',
            status: false,
            messages: [],
            showEditDetails: true,
            currentUser: {},
            currentConnection: null,
            currentlyCalling: null,
            queueStatus: false,
            callLog:[]
        };
        this.joinAdminGroup = this.joinAdminGroup.bind(this);
        this.leaveAdminGroup = this.leaveAdminGroup.bind(this);
        this.refreshCustomers = this.refreshCustomers.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.toggleStatus = this.toggleStatus.bind(this);
        this.renderStatus = this.renderStatus.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.closeChat = this.closeChat.bind(this);
        this.destroy = this.destroy.bind(this);
        this.cancelCall = this.cancelCall.bind(this);
        this.connect = this.connect.bind(this);
        this.callClient = this.callClient.bind(this);

    }
    static displayName = Admin.name;

    destroy() {
    }

    componentDidMount() {
        window.addEventListener('beforeunload', (event) => {
            //this.connection.invoke("RemoveSelfFromGroup").catch(function (err) {
            //    return console.error(err.toString());
            //});
            //this.connection.invoke("Disconnect", this.state.currentConnection).catch(function (err) {
            //    return console.error(err.toString());
            //});
            this.connection.stop();
        });

        this.connect();

    }

    componentWillUnmount() {
        /*this.connection.invoke("RemoveSelfFromGroup").catch(function (err) {
            return console.error(err.toString());
        });*/
        //this.connection.invoke("Disconnect", this.state.currentConnection).catch(function (err) {
        //    return console.error(err.toString());
        //});
        this.connection.stop();

    }

    connect() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub", {
                accessTokenFactory: () => authService.getAccessToken(),
            })
            .build();

        this.connection.on("send", data => {
            // console.log(data);
        });

        this.connection.on("YourStatus", data => {
            // console.log(data);
            if (data !== undefined && data !== null) {
                this.setState({ currentUser: data });
            }
        });

        this.connection.on("ReceiveMessage", data => {
            // console.log(data);
            let messages = [...this.state.messages, data];
            this.setState({ messages });
        });


        this.connection.on("Messages", data => {
            // console.log(data);
            this.setState({ messages: data });
        });

        this.connection.on("ClientList", data => {
            data.forEach(queueItem => {
                if (queueItem.connectedAdmin !== null && queueItem.connectedAdmin !== undefined && queueItem.connectedAdmin.id === this.state.currentUser.id) {
                    this.setState({ currentConnection: queueItem });
                }
            });
            this.setState({
                clientList: data
            });
        });

        this.connection.on("Error", data => {
            console.error(data);
        });

        this.connection.on("Answer", data => {
            let client = this.state.clientList.find(u => u.user.id === data.userId);
            console.log(client);

            if (client === undefined) {
                return;
            }

            if (client.user.contactMethod === 1) {
                let connectionString;
                if (this.state.currentUser.wherebyLink !== null && this.state.currentUser.wherebyLink !== undefined && this.state.currentUser.wherebyLink.includes('http')) {
                    connectionString = this.state.currentUser.wherebyLink;
                } else {
                    connectionString = 'https://' + this.state.currentUser.wherebyLink;
                }


            if (this.state.currentUser.wherebyLink !== undefined) {
                let myWindow = window.open(connectionString);   // Opens a new window
                // console.log(myWindow);

                myWindow.addEventListener('beforeunload', () => {
                    // console.log('window-closed');
                    alert("It looks like you have left the call");
                });

                myWindow.focus();

                this.setState({ activeChatWindow: myWindow });
                }
            }

        });

        this.connection.on("CallLog", data => {
            // console.log(data);
            this.setState({ callLog: data });
        });


        this.connection.on("CurrentConnections", data => {
            // console.log(data);
            this.setState({ connections: data });
        });

        this.connection.on("Disconnect", data => {
            // console.log("Received disconnect request from server");
            this.setState({ currentConnection: null, currentlyCalling: null, messages: [] })
        });

        this.connection.on("Rejected", data => {
            this.setState({ currentConnection: null })
        });


        this.connection.on("Connections", data => {
            this.setState({ connections: data });
        });

        this.connection.on("QueueStatus", data => {
            // console.log(data);
            this.setState({ queueStatus: data });
        });

        this.connection.on("Token", data => {
            // console.log(data);
        });

        this.connection.on("AdminList", data => {
            // console.log(data);
            this.setState({adminList: data})
        });

        this.connection.start()
            .then(
                () => {
                    // console.log("Connected to hub");
                    this.setState({ connected: true });
                    this.joinAdminGroup();
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
            console.log("connection state: " , this.connection.state === signalR.HubConnectionState.Reconnecting);

            this.setState({ connected: false });

        });

        this.connection.onreconnected(error => {
            console.log("reconnected");
            /*this.setState({ connected: true });
            this.joinAdminGroup();*/

        });
    }



    joinAdminGroup() {
        // console.log("Joining Admin Group")

        this.connection.invoke("AddAdminToGroup").catch((err, test) => {
            console.error(err, test);
            //authService.isAuthenticated().then((authResult) => {
            //    //// console.log(authResult);
            //    //authService.getUser().then(user => {
            //    //    // console.log(user);
            //    //});


            //    // To check if the token has expired
            //    authService.getAccessToken().then((token) => {
            //        // console.log(token);
            //        let parsedToken = authService.parseToken(token);
            //        let expiry = moment(parsedToken.exp);
            //        if (moment().isAfter(expiry)) {
            //            window.location.href = `${ApplicationPaths.Login}?${QueryParameterNames.ReturnUrl}=${encodeURI(window.location.href)}`;
            //        }
            //    });

            //});
           
        }).then(() => {
            this.refreshCustomers();
        });

    }

    leaveAdminGroup() {
        this.connection.invoke("RemoveAdminFromGroup", this.state.displayName).catch(function (err) {
            return console.error(err.toString());
        });
    }

    refreshCustomers() {
        this.connection.invoke("ClientList").catch(function (err) {
            return console.error(err.toString());
        });
    }

   
    updateDetails(user) {
        this.connection.invoke("UpdateAdminDetails", user).catch(function (err) {
            return console.error(err.toString());
        });
    }

    disconnect(queueItem) {
        this.connection.invoke("DisconnectAdmin", queueItem.user.id).catch(function (err) {
            return console.error(err.toString());
        });
    }

    toggleStatus() {
        let user = this.state.currentUser;
        if (user.status === 0) {
            user.status = 2;
        }
        else {
            user.status = 0;
        }
        this.updateDetails(user);
    }

    updateWherebyLink(value) {
        
    }

    renderStatus() {

        let connectionsCount = this.state.connections === undefined ? 0 : Object.entries(this.state.connections).filter(([key, val]) => {
            let result = true;
            this.state.adminList.forEach(admin => {
                if (admin.id === key) {
                    result = false;
                }
                });
            return result;
        }).length;

        return (
            
            <section className="status-section">
                <LargeIconButton
                    faIcon={faPlug}
                    label="Connection"
                    subLabel={this.state.connected ? 'Connected' : 'Error'}
                    className={this.state.connected ? "green" : "red"}
                />

                <LargeIconButton
                    faIcon={faUsers}
                    label="Viewers"
                    subLabel={connectionsCount}
                />
              
                <LargeIconButton
                    className={this.state.currentUser.status === 0 ? "green" : this.state.currentUser.status === 1 ? "yellow" : "red"}
                    onClick={this.toggleStatus}
                    faIcon={this.state.currentUser.status === 0 ? faEye : this.state.currentUser.status === 1 ? faHandshake : faEyeSlash}
                    label="Your Status"
                    subLabel={this.state.currentUser.status === 0 ? "Online" : this.state.currentUser.status === 1 ? "In Call" : "Offline"}
                />
              
                <LargeIconButton className={this.state.queueStatus === 1 ? "green" : "red"}
                    faIcon={this.state.queueStatus === 1 ? faSignal : faSignOutAlt}
                    label="App Status"
                    subLabel={this.state.queueStatus === 1 ? "Online" : "Offline"} />

                <CallLog callLog={this.state.callLog} currentUser={this.state.currentUser} />
                
                <UserDetails
                    connection={this.connection}
                    user={this.state.currentUser}
                    updateState={(showEditDetails) => this.setState({ showEditDetails })}
                    editing={this.state.showEditDetails} />
                  
            </section>
        );
    }


    renderConnections() {


        let connection = this.state.clientList.find(queueItem => queueItem.connectedAdmin !== null && queueItem.connectedAdmin !== undefined && queueItem.connectedAdmin.id === this.state.currentUser.id);
        if (connection === undefined) {
            return null;
        }
        // console.log(connection);

        let callStatus = connection.callStatus === 0 ? "Disconnected" : connection.callStatus === 1 ? "Calling" : "In Call";
        
        return (
            <div>
                    <h1>Current Connection</h1>
                    <ListGroup className="connections-list">
                        <ListGroupItem>
                                <span>{connection.connectedAdmin?.displayName}</span>
                                <span>{connection.user?.displayName}</span>
                        <span>{callStatus}</span>
                        <span>
                            {this.props.currentlyCalling?.user?.phoneNumber && <Button color="primary" tag="a" target="hidden-iframe" href={`tel:${this.props.currentlyCalling?.user?.phoneNumber}`}><FontAwesomeIcon icon={faPhone} /> Call </Button>}
                            <Button color="danger" onClick={() => this.disconnect(connection)}>Disconnect</Button>
                        </span>
                    </ListGroupItem>
                    </ListGroup>
            </div>
        )
    }

    cancelCall() {
        this.connection.invoke("CancelCall", this.state.currentConnection).catch(function (err) {
            return console.error(err.toString());
        });
        this.setState({ currentConnection: null });

    }

    sendMessage(userId, message) {
        this.connection.invoke("SendPrivateMessage", this.state.currentUser.id, userId, message).catch(function (err) {
            return console.error(err.toString());
        });

    }

    closeChat() {
        // console.log(this.state.currentConnection.Value);
        this.connection.invoke("DisconnectUser", this.state.currentConnection.Value).catch(function (err) {
            return console.error(err.toString());
        });
    }

    callClient(user) {
        if (user.contactMethod === Contact.contactMethods['chat']) {
            this.connection.invoke("ForceAnswer", user.id).catch(function (err) {
                return console.error(err.toString());
            });
        } else {
            this.connection.invoke("Ring", user).catch(function (err) {
                return console.error(err.toString());
            });
        }
    }

    render() {
        return (
            <Layout location={this.props.location}>
            <div className="admin-container">
                <h1>Admin</h1>

                {this.renderStatus()}
                <section>
                    <Row>
                        <Col md="4">
                            <AdminList callLog={this.state.callLog} adminList={this.state.adminList} />
                        </Col>
                            <Col md="8">
                                {this.renderConnections()}

                                {this.state.currentConnection !== null && this.state.currentConnection.callStatus === 2 ? <ChatSection currentUser={this.state.currentUser} onSendMessage={this.sendMessage} closeChat={this.closeChat} currentCall={this.state.currentConnection} messages={this.state.messages} />
                                    : <ClientList currentUser={this.state.currentUser}
                                connection={this.connection}
                                clientList={this.state.clientList}
                                currentlyCalling={this.state.currentlyCalling}
                                callClient={this.callClient}
                                /> }


                        </Col>
                    </Row>
                </section>
                    {this.state.currentConnection !== null && this.state.currentConnection.callStatus !== 2 && <AdminCalling connection={this.connection} cancelCall={this.cancelCall} currentlyCalling={this.state.currentConnection} />}

                </div>
                </Layout>
        );
    }
}
