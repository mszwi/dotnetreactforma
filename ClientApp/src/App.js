import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Home } from './components/home/Home';
import { Admin } from './components/admin/Admin';
import AuthorizeRoute from './components/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './components/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './components/api-authorization/ApiAuthorizationConstants';
import * as signalR from '@microsoft/signalr';
import { SettingsContext } from './SettingsContext';
import moment from 'moment';
import 'moment/locale/nb';

import './custom.scss'
import { Spinner } from 'reactstrap';

export default class App extends Component {
    static displayName = App.name;
    static contextType = SettingsContext;

    constructor() {
        super();
        this.state = {
            loading: true, settings: {}, connected: false
        }
        this.getStyles = this.getStyles.bind(this);

    }

    componentDidMount() {
        
        //this.getStyles();
        this.connect();
    }

    async getStyles() {
        //const token = await authService.getAccessToken();
    //    const response = await fetch('https://foma.no/umbraco/api/messeApi/messeProgram?messeID=17810', {
    //        headers: { accessControlAllowOrigin: '*' },
    //        mode: 'no-cors'
    //    });
    //});

        const response = await fetch('/Messa/Current', {
            headers: {},
        });

        let data = await response.json();
        //console.log(data);

        this.setState({ settings: data, loading: false });
    }


    connect() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/messaHub")
            .build();

        this.connection.on("Settings", data => {
            if (localStorage.getItem('07_dev') !== null) {
                data.kontaktSelger.visKontaktknappSelger = true;
                data.kontaktSelger.deaktiverKontaktknappSelger = false;
                data.konkurranse.visKonkurranseknapp = true;
                data.konkurranse.deaktiverKonkurransekknapp = false;
                data.kontaktSupport.visKontaktknappSupport = true;
                data.kontaktSupport.deaktiverKontaktknappSupport = false;
                data.messeStart = moment().add(5, 'seconds');
                //data.sending = data.sending.map((sending, index) => {
                //    //if (index === 0) {
                //    //    sending.sendingStarter = moment().startOf('day');
                //    //    sending.sendingSlutter = moment().endOf('day');
                //    //    //sending.sendeskjema = sending.sendeskjema.map((item, index) => {
                //    //    //    item.klokkeslett = moment().add(index*30, 'seconds');
                //    //    //    return item;
                //    //    //});
                //    //}
                //    return sending;
                //});
            }
            this.setState({ settings:data, loading: false });
        });

        this.connection.on("Debug", data => { console.log(data) });

        this.connection.start()
            .then(
                () => {
                    console.log(window.location.hostname)
                    if (window.location.hostname === 'videostream.foma.no') {
                        // console.log("Connected to hub");
                        this.setState({ connected: true });
                        this.connection.invoke("GetTestSettings").catch(function (err) {
                            return console.error(err.toString());
                        });
                    // console.log(this.connection);
                    } else {
                        // console.log("Connected to hub");
                        this.setState({ connected: true });
                        this.connection.invoke("UpdateSettings").catch(function (err) {
                            return console.error(err.toString());
                        });
                    // console.log(this.connection);
                    }
                   
                },
                () => this.setState({ connected: false })
            );
    }

    render() {
        console.log(this.state.settings);

        if (this.state.loading) {
            return (
                <div className="loading">
                    <Spinner color="primary" />
                </div>
            );
        } else {
            return (
                <SettingsContext.Provider value={this.state.settings}>
                    <Switch>
                        <AuthorizeRoute path='/admin' component={Admin} />
                        <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
                        <Route path='/' component={Home} />
                    </Switch>
                </SettingsContext.Provider>
            );
        }
  }
}
