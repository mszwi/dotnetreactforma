import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import { MessaProgramLine } from './MessaProgramLine';
import moment from 'moment';
import anime from 'animejs/lib/anime.es.js';
import { SettingsContext } from '../../SettingsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import mediaQuery from '../media-query';
import styleHelpers from '../styleHelpers';
import 'moment/locale/nb';

export class MessaProgram extends Component {
    static displayName = MessaProgram.name;
    static contextType = SettingsContext;

    constructor(props) {
        super(props);
        this.state = { currentTime: moment.utc(), program: undefined, start: undefined, end: undefined, expanded: false };
        // console.log(props);
        this.getCurrentProgram = this.getCurrentProgram.bind(this);
        this.scrollToCurrent = this.scrollToCurrent.bind(this);
        this.renderExpander = this.renderExpander.bind(this);
        this.renderListItems = this.renderListItems.bind(this);
    }

    componentDidMount() {
       
        //setTimeout(this.scrollToCurrent, );

        //this.interval = setInterval(() => {
        //    // console.log("Program Updated");
        //    this.setState({ currentTime: moment.utc() });

        //    this.scrollToCurrent();
        //}, 30000)

        anime({
            targets: '.program',
            duration: 300,
            easing: 'easeOutQuad',
            opacity: [0, 1],
            delay: 400,
        });

        anime({
            targets: '.program-line',
            duration: 200,
            easing: 'easeOutQuad',
            opacity: [0, 1],
            translateY: ['15%', '0%'],
            delay: anime.stagger(100, { start: 500 }),
        });

        setTimeout(this.getCurrentProgram, 1000);

        this.interval = setInterval(this.getCurrentProgram, 6000);
    }

    wheelEvent(e) {
        e.target.scrollBy(0, 0.1 * e.deltaY);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getCurrentProgram() {
        if (!this.context.sending || this.context.sending.length === 0) {
            return;
        }

        let current = this.context.sending.find(program => {
            let start = moment.utc(program.sendingStarter);
            let end = moment.utc(program.sendingSlutter);
            return moment.utc().isBetween(start, end);
        });
        if (current === undefined) {
            return this.setState({ program: this.context.sending[0].sendeskjema.filter(item => item.link), start: moment().startOf('day'), end: moment().endOf('day') });

        }
        if (current !== undefined) {
            let start = moment.utc(current.sendingStarter);
            let end = moment.utc(current.sendingSlutter);
            return this.setState({ program: current.sendeskjema, start, end });
        }
        return this.setState({ program: undefined, start: undefined, end: undefined });
        }

    scrollToCurrent() {
        let ul = document.querySelector(".program .list-group");
        if (ul === null) {
            return
        }
        let current = ul.querySelector('.current');
        if (current === null) {
            return;
        }
        
        let ulRect = ul.getBoundingClientRect();
        let cuRect = current.getBoundingClientRect();
        let scrollTop = current.offsetTop;
        if (!mediaQuery.isHandheld() || this.state.expanded) {
            scrollTop += cuRect.height / 2;
            scrollTop -= ulRect.height / 2;
        }

        anime({
            targets: ul,
            scrollTop,
            duration: 400,
            easing: 'linear'
        });
    }

    renderListItems() {

        let sorted = this.state.program !== null ? [...this.state.program].sort((a, b) => {
            let timeA = moment(a.klokkeslett);
            let timeB = moment(b.klokkeslett);
            return timeA.diff(timeB)
        }) : [];
        
        let listItems = sorted.map((item, index) => {
            let time = moment(item.klokkeslett);
            let mesa = {
                time,
                link: item.link,
                name: item.navn
            }
            let nextStart = sorted.length <= index + 1 ? moment().endOf('day') : moment.utc(sorted[index + 1].klokkeslett);
            let isCurrent = this.state.currentTime.isBetween(time, nextStart);
            let isFinished = this.state.currentTime.isAfter(nextStart);
            return <MessaProgramLine isFinished={isFinished} isCurrent={isCurrent} index={index} videoLinkClick={this.props.videoLinkClick} key={mesa.time.format('YYMMDDHHMMHHmm') + "_" + mesa.name} {...mesa} />
        });

        return listItems;
    }

    renderExpander() {
        if (!mediaQuery.isHandheld()) {
            return null;
        }
        return this.state.expanded ?
            <FontAwesomeIcon color={styleHelpers.styles.black} icon={faMinus} onClick={() => { this.setState({ expanded: false }); setTimeout(this.scrollToCurrent, 100) }} /> :
            <FontAwesomeIcon color={styleHelpers.styles.black} icon={faPlus} onClick={() => this.setState({ expanded: true })} />
    }

    render() {
        if (!this.state.program) {
            return null;
        }

        return (

          
                <div component="div" className="program">

                    <div key="ph" className="program-header">
                    <h1>PROGRAM</h1>
                    {this.renderExpander()}
                </div>
                <ListGroup key="lg" onWheel={this.wheelEvent} className={this.state.expanded ? 'expanded': ''}>

                        {this.renderListItems()}

                    </ListGroup>
                </div>




        );
    }
}
