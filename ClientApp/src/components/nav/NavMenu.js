import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import { LoginMenu } from '../api-authorization/LoginMenu';
import './NavMenu.css';
import authService from '../api-authorization/AuthorizeService';
import { blackBackground } from '../styleHelpers';
import { SettingsContext } from '../../SettingsContext';
import moment from 'moment';

export class NavMenu extends Component {
    static displayName = NavMenu.name;
    static contextType = SettingsContext;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            isAuthenticated: false,
            userName: null
        };
    }

    componentDidMount() {
        this._subscription = authService.subscribe(() => this.populateState());
        this.populateState();
    }

    componentWillUnmount() {
        authService.unsubscribe(this._subscription);
    }

    async populateState() {
        const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
        this.setState({
            isAuthenticated,
            userName: user && user.name
        });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    //                            <span>{moment(this.context.messeStart).format('DD.')} - {moment(this.context.messeSlutt).format('DD.')} {moment(this.context.messeStart).format('MMMM').toLowerCase()}</span>

    render() {
        return (
            <header style={blackBackground()}>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/"><img src={this.context.logo} alt="Foma Logo" /></NavbarBrand>
                        <div style={{ textAlign: 'center' }}>
                            <h1 to="/">{this.context.messeNavn}</h1>
                        </div>
                        <NavbarBrand tag={Link} to="/"><img src={this.context.logo2} alt="Quality Badge" /></NavbarBrand>
                    </Container>
                    {this.props.location.pathname === '/admin' && this.state.isAuthenticated &&
                        <Container style={{ flex: '1 1 auto' }}>
                            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />

                            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                                <ul className="navbar-nav flex-grow">
                                    <NavItem>
                                        <NavLink tag={Link} className="text-light" to="/">Home</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink tag={Link} className="text-light" to="/admin">Admin</NavLink>
                                    </NavItem>
                                    <LoginMenu>
                                    </LoginMenu>
                                </ul>
                            </Collapse>
                        </Container>
                    }
                </Navbar>
            </header>
        );
    }
}
