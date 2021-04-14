import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import { AdminUser } from './AdminUser';
import moment from 'moment';


export class AdminList extends Component {
    static displayName = AdminList.name;

  constructor(props) {
    super(props);
      this.state = {};
      this.countAdminCalls = this.countAdminCalls.bind(this);
    }

    countAdminCalls(adminUser) {
        let count = this.props.callLog.reduce((subTotal, logItem) => {
            if (!moment(logItem.eventTime).isBetween(moment().startOf('day'), moment().endOf('day'))) {
                return subTotal;
            }

            if (logItem.admin?.id !== adminUser?.id) {
                return subTotal;
            }

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

  render() {
      let admins = this.props.adminList.map((adminUser, index) => {
          return (<AdminUser
              key={adminUser.id}
              adminUser={adminUser}
              callCount={this.countAdminCalls(adminUser)}
          />);

      });

      return (
          <div>
              <h1>Admin List</h1>
              <ListGroup className="admin-list">
                {admins}
            </ListGroup>
          </div>
      )
  }
}
