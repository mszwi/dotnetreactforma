import React, { Component } from 'react';
import {  InputGroup, Input, InputGroupAddon, InputGroupText, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';

export class PhoneInput extends Component {
    static displayName = PhoneInput.name;
    static validate = RegExp(/^(\+\d{1,3}[- ]?)?\d{6,}$/);

  constructor(props) {
    super(props);
      this.state = {};
      this.isValid = this.isValid.bind(this);
    }

    isValid(val) {
        return PhoneInput.validate.test(val);
    }

    render() {
        let valid = this.isValid(this.props.value);
    return (
        <InputGroup>
            <InputGroupAddon addonType="prepend">
                <InputGroupText><FontAwesomeIcon color={valid ? 'green' : 'red'} icon={faPhone} /></InputGroupText>
            </InputGroupAddon>
            <Input style={{ color: valid ? 'green' : 'red' }} autoComplete="phone" placeholder="Telefon" value={this.props.value} onChange={this.props.onChange} />
            <InputGroupAddon addonType="append">
                <InputGroupText>{valid ? <FontAwesomeIcon color="green" icon={faCheck} /> : <FontAwesomeIcon color="red" icon={faExclamation} />}</InputGroupText>
            </InputGroupAddon>
        </InputGroup>
    );
  }
}
