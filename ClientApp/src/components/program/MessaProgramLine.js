import React, { Component } from 'react';
import { ListGroupItem } from 'reactstrap';
import * as moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import styleHelper from '../styleHelpers';

export class MessaProgramLine extends Component {
    static displayName = MessaProgramLine.name;

    constructor(props) {
        super(props);
        this.state = {};
        this.ref = React.createRef();
    }

    componentDidMount() {
 
    }

    render() {
        var classString = 'program-line';
        var style = { borderRadius: 0, borderBottomColor: styleHelper.styles.white};
        if (this.props.isCurrent) {
            classString += ' current';
            style.backgroundColor = styleHelper.styles.darkBackground;
            //style.backgroundColor = styleHelper.styles.primary;
            style.color = styleHelper.styles.white;

        } else if (this.props.isFinished) {
            classString += ' finished';
            //style.backgroundColor = styleHelper.styles.;
            //style.color = styleHelper.styles.white;
            style.backgroundColor = styleHelper.styles.darkBackground;
            style.color = styleHelper.styles.white;
        } else {
            //style.backgroundColor = styleHelper.styles.lightBackground;
            //style.color = styleHelper.styles.white;
        }
               
        // 
        return (
            <ListGroupItem className={classString} style={style} >
                <span>{moment(this.props.time).local().format('DD.MM HH:mm')}</span>
                <span>{this.props.name}</span>
                <span className="video-icon" style={{ color: styleHelper.styles.primary }}>
                    {this.props.link ? <FontAwesomeIcon style={{ color: styleHelper.styles.primary }} onClick={() => { this.props.videoLinkClick(this.props.name, this.props.link) }} icon={faVideo} /> : null}
                </span>
            </ListGroupItem>
        );
    }
}
