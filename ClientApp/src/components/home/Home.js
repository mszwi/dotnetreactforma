import React, { Component } from 'react';
import { LiveStream } from '../LiveStream';
import { MessaProgram } from '../program/MessaProgram';
import { Contact } from '../Contact';
import styleHelper, { lightBackground, blackBackground } from '../styleHelpers';
import { SettingsContext } from '../../SettingsContext';
import moment from 'moment';
import { Countdown } from '../Countdown';
import anime from 'animejs';
import { Layout } from '../Layout';

export class Home extends Component {
    static contextType = SettingsContext;
    static displayName = Home.name;

    constructor(props) {

        super(props);
        this.state = {
            streamSrc: false,
            streamTitle: 'SENDING',
        };

        this.videoLinkClick = this.videoLinkClick.bind(this);

    }

    componentDidMount() {

        let startTime = moment.utc(this.context?.messeStart);
        let now = moment.utc();
        setTimeout(() => {
            this.forceUpdate();
        }, moment.duration(startTime.diff(now)).asMilliseconds());


        anime({
            targets: '.home-top-right',
            duration: 400,
            easing: 'linear',
            opacity: [0, 1],
            translateX: ['100%', '0%'],
            delay: 400,
        });
    
        anime({
            targets: '.home-top-right .info-header',
            duration: 400,
            easing: 'linear',
            opacity: [0, 1],
            translateX: ['100%', '0%'],
            delay: 300,
        });

        anime({
            targets: '.home-top-left .text-box',
            duration: 600,
            easing: 'linear',
            opacity: [0, 1],
            translateY: ['20%', '0%'],
            delay: 400,
        });
    }

    videoLinkClick(name, stream) {
        this.setState({ streamTitle: name, streamSrc: stream });
    }

    render() {
        
            

        let startTime = moment.utc(this.context?.messeStart);
        let hasProgram = this.context?.sending?.length > 0 && this.context?.sending?.some(item => moment(item?.sendingSlutter).isAfter(moment()))
        let topLeftStyle = {}
        if (!hasProgram) {
            topLeftStyle.gridTemplateColumns = '1fr';
        }

        let topLeft = (
            <div className="live-stream-container" style={topLeftStyle}>
                <LiveStream videoLinkClick={this.videoLinkClick} streamTitle={this.state.streamTitle} streamSrc={this.state.streamSrc || this.context.videoUrl} />
                {hasProgram && <MessaProgram videoLinkClick={this.videoLinkClick} />}
                </div>
              

        );
        let hasStarted = startTime.isBefore(moment.utc());
        let countdown = <Countdown startTime={startTime} />
        let homeStyle = hasStarted ? { backgroundImage: `url(${this.context.bakgrunnsbilde})` } : {}
        return (
            <Layout location={this.props.location}>
                <div className="home-container" style={homeStyle}>
                <div className="home-top">
                    <section className="home-top-left">
                            {hasStarted ? topLeft : countdown}

                        <div className="text-box" style={{ ...lightBackground(), width: '100%', padding:'1rem' }} dangerouslySetInnerHTML={{ __html: this.context.tekstOverKnapper }}  />

                        <Contact updateDetails={this.updateDetails} />
                    </section>

                    <section className="home-top-right" style={lightBackground()}>
                        <div className="info-header"><h1 style={{ color: styleHelper.styles.primary }} >INFO</h1></div>
                        <div className="extra-info" style={{ color: styleHelper.styles.primary }} dangerouslySetInnerHTML={{ __html: this.context.messeInfo }} />
                    </section>
                </div>

                <section className="bottom-text">
                    <div className="text-box" style={blackBackground()} dangerouslySetInnerHTML={{ __html: this.context.bunntekst }} />
                </section>
               
                </div>
                </Layout>
        );
    }
}

