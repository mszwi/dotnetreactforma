import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styleHelper from './styleHelpers';
import { Button, Spinner } from 'reactstrap';
import anime from 'animejs';

export class LargeIconButton extends Component {
    static displayName = LargeIconButton.name;

  constructor(props) {
    super(props);
      this.state = {loading: false};
      this.ref = React.createRef();
      this.clicked = this.clicked.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.show !== this.props.show) {
            if (this.props.show) {
                anime({
                    targets: this.ref.current,
                    duration: 600,
                    easing: 'linear',
                    scale: [0, 1],
                    delay: 300,
                });
            }
        }

        if (prevState.loading) {
            this.setState({loading: false});
        }
    }

    componentDidMount() {
       
    }

    clicked() {
        if (typeof this.props.onClick !== 'function') {
            return;
        }

        this.setState({ loading: true });

        this.props.onClick();
    }

    render() {
        let styles = { backgroundColor: styleHelper.styles.black, color: styleHelper.styles.white };

        let classnames = 'large-icon-button icon-container';

        //if (this.props.disabled !== undefined && this.props.disabled) {
        //    classnames += ' disabled';
        //}

        if (this.props.className !== '' && this.props.className !== undefined) {
            classnames += ' ' + this.props.className;
        }

        let props ={ };

        if (this.props.show === undefined || this.props.show) {
            if (typeof this.props.onClick === 'function') {
                props.tag = 'button';
            } else if (this.props.href !== undefined && this.props.href !== '') {
                props.tag = 'a';
                props.href = this.props.href;
                props.rel = 'noopener noreferrer'
                props.target = this.props.target || '_blank'
            }
                else {
                props.tag = 'div';
            }


            let button = (
                <Button {...props} disabled={this.state.loading || (this.props.disabled !== undefined && this.props.disabled)} ref={this.ref} size="lg" onClick={this.clicked} className={classnames} style={styles}>
                    
                    {this.state.loading ? <Spinner /> : <FontAwesomeIcon icon={this.props.faIcon} color={styleHelper.styles.white} />}
                    <span>
                        <h2>{this.props.label}</h2>
                        {this.props.subLabel && <span>{this.props.subLabel}</span>}
                    </span>

                    {this.props.modal && this.props.modal}
                </Button>
            );



            return button;

        } 

        return null;
        
  }
}
