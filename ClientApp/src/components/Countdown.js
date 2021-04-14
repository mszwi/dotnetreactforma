import React, { Component } from 'react';
import moment from 'moment';
import { SettingsContext } from '../SettingsContext';
import { Spinner } from 'reactstrap';
import anime from 'animejs';

export class Countdown extends Component {
    static displayName = Countdown.name;
    static contextType = SettingsContext;

  constructor(props) {
    super(props);
      this.state = {
          currentTime: moment.utc(),
          fallbackTime: moment().add(3, 'seconds')
      };

    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({ currentTime: moment.utc() });
        }, 1000);

        anime({
            targets: '.countdown',
            duration: 400,
            easing: 'linear',
            opacity: [0, 1],
            delay: 300,
        });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {

        if (!this.props.startTime) {
            return (<div className="countdown">
                <h1>Looking for the next Messa</h1>
                <Spinner />
            </div>);
        }
        let startTime = moment.utc(this.props.startTime);

        let timeDifference = moment.duration(startTime.diff(this.state.currentTime));
        let timestring = `${timeDifference.days()}d ${timeDifference.hours()}t ${timeDifference.minutes()}m ${timeDifference.seconds()}s`
        let style = { backgroundImage: `url(${this.context.bildeNedtelling})` }

      return (
          <div className="countdown" style={style}>
              <div className="clock">
                  <h1>{this.context.messeNavn} begynner om</h1>
                  <span className="time">{timestring}</span>
              </div>
          </div>
    );
  }
}
