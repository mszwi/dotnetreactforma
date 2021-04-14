import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import { Customer } from './Customer';
import { Contact } from '../Contact';

export class ClientList extends Component {
    static displayName = ClientList.name;

  constructor(props) {
    super(props);
      this.state = {};
      this.connectToCustomer = this.connectToCustomer.bind(this);
      this.deleteCustomer = this.deleteCustomer.bind(this);
    }

    connectToCustomer(customer) {
        if (this.props.currentUser.wherebyLink === null || this.props.currentUser.wherebyLink === '') {
            alert("You need to set a value for Whereby link");
            return this.setState({ showUserDetails: true });

        }

        this.setState({ currentConnection: customer });

    }

    deleteCustomer(customer) {
        this.props.connection.invoke("DeleteUser", customer.id).catch(function (err) {
            return console.error(err.toString());
        });
    }

    render() {
        let customers = this.props.clientList.filter(customer => customer.user.contactMethod !== null && customer.user.type === 1 && (customer.user.contactMethod !== Contact.contactMethods.phone || customer.user.phoneNumber));
      // console.log(customers);
      if (customers === undefined) {
          return null;
      }
      customers = customers.map((customer, index) =>
              <Customer
              key={customer.user.id}
                    {...this.props}
                  deleteCallback={this.deleteCustomer}
                  customer={customer}
                  position={index + 1}
              />
          );

      return (
          <div>
            <h1>Client List</h1>
            <ListGroup className="customer-list">
                {customers}
            </ListGroup>
          </div>
      );
  }
}
