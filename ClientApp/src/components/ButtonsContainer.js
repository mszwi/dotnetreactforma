import React, { Component } from 'react';
import anime from 'animejs';

export class ButtonsContainer extends Component {
    static displayName = ButtonsContainer.name;

  constructor(props) {
    super(props);
        this.container = React.createRef();
    this.state = {};
  }

    componentDidMount() {
        // console.log(this.container.current);
        anime({
            targets: this.container.current.children,
            duration: 600,
            easing: 'easeOutElastic',
            scale: [0, 1],
            delay: anime.stagger(100, { start: 300 }),
        });

    }

    render() {
        return (
            <div {...this.props} ref={this.container}>
                {this.props.children}
            </div>
        );
  }
}
