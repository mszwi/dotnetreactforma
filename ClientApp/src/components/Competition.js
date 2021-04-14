import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/nb';

import { LargeIconButton } from './LargeIconButton';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons';
export class Competition extends Component {
    static displayName = Competition.name;

    constructor(props) {
        super(props);
        this.state = {
        };
        this.onClick = this.onClick.bind(this);
        this.isDisabled = this.isDisabled.bind(this);
    }

    isDisabled() {
        let start = moment.utc(this.props.competition.konkurranseStart);
        let end = moment.utc(this.props.competition.konkurranseSlutt);
        return !moment().isBetween(start, end);
    }

    onClick() {
        if (this.isDisabled()) {
            return alert('Sorry this competition is now closed');
        }
        console.log(this.props.competition);
        this.props.selectCompetition(this.props.competition.konkurranseId);
    }

    render() {
        let className = 'competition';

        if (this.props.hasEntered) {
            className += ' yellow';
        } else if (this.props.isSelected) {
            className += ' green';

        }
        if (this.isDisabled()) {
            return null;
        }

        let disabled = this.props.hasEntered || !this.props.isValid;

        let subText = this.props.hasEntered ? 'Du er p\u00E5meldt konkurransen' : this.props.competition.konkurranseTekst;
        return (
            <div>
            <LargeIconButton disabled={disabled} label={this.props.competition.konkurranseNavn} subLabel={subText} className={className} faIcon={faTicketAlt} onClick={this.onClick} />
</div>        )
    }
}
