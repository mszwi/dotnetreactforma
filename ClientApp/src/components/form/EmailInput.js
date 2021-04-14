import React, { Component } from 'react';
import {  InputGroup, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';

export class EmailInput extends Component {
    static displayName = EmailInput.name;
    static validate = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);


  constructor(props) {
    super(props);
      this.state = {};
      this.isValid = this.isValid.bind(this);
    }

    isValid(val) {
        return EmailInput.validate.test(val);
    }

    render() {
        let valid = this.isValid(this.props.value);
    return (
        <InputGroup>
            <InputGroupAddon addonType="prepend">
                <InputGroupText style={{ color:valid ? 'green' : 'red' }}>@</InputGroupText>
            </InputGroupAddon>
            <Input style={{ color: valid ? 'green' : 'red' }} autoComplete="email" placeholder="E-post" value={this.props.value} onChange={this.props.onChange} />
            <InputGroupAddon addonType="append">
                <InputGroupText>{valid ? <FontAwesomeIcon color="green" icon={faCheck} /> : <FontAwesomeIcon color="red" icon={faExclamation} />}</InputGroupText>
            </InputGroupAddon>
        </InputGroup>
    );
  }
}
