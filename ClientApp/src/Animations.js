import anime from 'animejs';
import React from 'react';

export const FadeIn = (item, duration) => {
    // console.log('fading in', item, duration);
    anime({
        targets: item,
        duration: duration,
        easing: 'linear',
        opacity:[0,1]
    });
}

export const FadeOut = (item, duration) => {
    anime({
        targets: item,
        duration: duration,
        easing: 'linear',
        opacity: [1, 0]
    });
}

export function Animation(Component) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.ref = React.createRef();

            this.state = {
                shouldRender: this.props.isMounted
            };
        }

        componentDidMount() {
            if (this.props.isMounted) {
                FadeIn(this.ref.current, this.props.delayTime);
            }
        }
        

        componentDidUpdate(prevProps, prevState) {
            if (prevProps.isMounted && !this.props.isMounted && prevState.shouldRender) {

                FadeOut(this.ref.current, this.props.delayTime);
                setTimeout(
                    
                    () => this.setState({ shouldRender: false }),
                    this.props.delayTime
                );
            } else if (!prevProps.isMounted && this.props.isMounted && !prevState.shouldRender) {
                this.setState({ shouldRender: true });
                FadeIn(this.ref.current, this.props.delayTime);

            }
        }

        render() {
            return this.state.shouldRender ? <Component ref={this.ref} {...this.props} /> : null;
        }
    };
}