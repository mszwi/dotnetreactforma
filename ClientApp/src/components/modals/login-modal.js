import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export class LoginModal extends Component {
    static displayName = LoginModal.name;

  constructor(props) {
    super(props);
    this.state = {emailInput: ''};
    }

    componentDidMount() {
        this.setState({ emailInput: this.props.currentUser.email });
    }

    emailChange(val) {
        this.setState({ emailInput: val });
    }

  render() {
      return (
          <Modal isOpen={this.props.isOpen} toggle={this.toggle} className="contact-method-modal">
              <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
              <ModalBody>
                  <p>First we need your email. You can fill in the rest of the details later if you like</p>

                  <div className="input-group">
                      <div className="input-group-prepend">
                          <span className="input-group-text" id="inputGroup-sizing-default">Email</span>
                      </div>
                      <input className="form-control" id="email-input" value={this.state.emailInput || ''} onChange={(e) => { this.emailChange(e.target.value); }} />
                  </div>

              </ModalBody>
              <ModalFooter>
                  <Button color="warn" onClick={this.props.cancelCallback}>Cancel</Button>
                  <Button color="primary" onClick={this.props.loginCallback} >Submit</Button>
              </ModalFooter>
        </Modal>
    );
  }
}
