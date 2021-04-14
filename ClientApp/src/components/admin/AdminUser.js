import React, { Component } from 'react';
import { ListGroupItem, Badge} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export class AdminUser extends Component {
    static displayName = AdminUser.name;

  constructor(props) {
    super(props);
      this.state = {};
  }
   

    status() {
        // console.log(this.props.adminUser);

        switch (this.props.adminUser.status) {
            case 0:
                return 'Ledig'
            case 1:
                return 'Opptatt'
            case 2:
                return 'Offline'
            default: return 'Unknown'
        }
        
    }

    render() {

      return (
          <ListGroupItem className="admin" >
              <div><Badge pill>{this.props.callCount}</Badge></div>
              <span>{this.props.adminUser?.displayName}</span>
              <a href={`mailto:${this.props.adminUser?.email}`}><FontAwesomeIcon icon={faEnvelope} /> </a>
              <a href={`tel:${this.props.adminUser?.phoneNumber}`}><FontAwesomeIcon icon={faPhone} /> </a>
              <span>
                  {this.status()}
               </span>
          </ListGroupItem>
    );
  }
}
