import React, { Component } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { SettingsContext } from '../SettingsContext';
const YT = window.YT;

export class LiveStream extends Component {
    static displayName = LiveStream.name;
    static contextType = SettingsContext;

    constructor(props) {
        super(props);
        this.state = {};
        this.iframe = React.createRef();
        this.done = false;
        this.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
        this.onPlayerReady = this.onPlayerReady.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.switchVideo = this.switchVideo.bind(this);
        this.play = this.play.bind(this);

    }

    componentDidUpdate(prevProps) {
        if (prevProps.streamSrc !== this.props.streamSrc) {
            this.switchVideo();
        }
    }

    switchVideo() {
        this.player.loadVideoByUrl(this.props.streamSrc);
        this.play();

    }

    componentDidMount() {
        anime({
            targets: 'iframe',
            translateX: ['-10%', '0%'],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad',
            delay: 400,
        });

        anime({
            targets: '.stream-container h1',
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad',
            delay: 800,
        });
        this.onYouTubeIframeAPIReady();
    }

    onYouTubeIframeAPIReady() {
        console.log(window.location.hostname)
        this.player = new YT.Player('player', {
            height: '315',
            width: '560',
            events: {
                'onReady': this.onPlayerReady,
            },
            playerVars: {
                rel: 0,
                autoplay: 1,
                enablejsapi: 1,
                origin: window.location.hostname
            }
        });

        
        setTimeout(() => {
            this.player.loadVideoByUrl(this.props.streamSrc);
            this.play();

        }, 2000)
    }

    play() {
        this.player.playVideo();
    }
    // 4. The API will call this function when the video player is ready.
    onPlayerReady(event) {
        
    }


    stopVideo() {
        this.player.stopVideo();
    }

    render() {
        return (
            <div className="stream-container">
                <div className="stream-heading">

                    <h1>{this.props.streamTitle}</h1>
                    {this.context.videoUrl !== this.props.streamSrc &&
                        <span onClick={() => { this.props.videoLinkClick('HOVEDSENDING', this.context.videoUrl) }} >
                            HOVEDSENDING <FontAwesomeIcon icon={faVideo} />
                        </span>
                     }
                </div>
                <div className="video-container">
                    <div id="player" />
                </div>
            </div>
        );
    }
}
//                <iframe ref={this.iframe} title="Main Stream" width="560" height="315" src={this.props.streamSrc} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>
//  {
//this.context.videoUrl !== this.props.streamSrc &&
                        //<span onClick={() => { this.props.videoLinkClick('DIREKTESENDING', this.context.videoUrl) }} >
                        //    SE DIREKTE <FontAwesomeIcon icon={faVideo} />
                        //</span>
   //                 }