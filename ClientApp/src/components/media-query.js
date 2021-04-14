class MSMediaQuery {
    constructor() {
        this.windowResizing = false;
        this.resizeTimeout = null;
        this.currentSize = this.isMobile() ? 'mobile' : this.isDesktop() ? 'desktop' : 'tablet';
        this.previousSize = null;
        this.onReSize = this.onReSize.bind(this);
        this.traveled = this.traveled.bind(this);
        this.originalPixelRatio = window.devicePixelRatio || 1;
        this.originalWidth = window.innerWidth;
        this.originalHeight = window.innerHeight;

        this.resizeStartedEvent = new CustomEvent('media-query-resize-started');
        this.resizeFinishedEvent = new CustomEvent('media-query-resize-finished');

        this.onReSize();
        window.addEventListener('resize', this.onReSize);
    }

    traveled() {
        return { y: window.innerHeight - this.originalHeight, x: window.innerWidth - this.originalWidth };
    }

    isDesktop() {
        return window.matchMedia('(min-width: 1201px)').matches;
    }

    isMobile() {
        return window.matchMedia('(max-width: 567px)').matches;
    }

    isTablet() {
        return window.matchMedia('(min-width: 568px) and (max-width: 1200px)').matches;
    }

    isHandheld() {
        return window.matchMedia('(max-width: 1200px)').matches;
    }

    onReSize(e) {
        let traveled = this.traveled();
        if (traveled.y > 400 || traveled.y < -400 || traveled.x > 200 || traveled.x < -200) {

            if (!this.windowResizing) {
                this.windowResizing = true;
                window.dispatchEvent(this.resizeStartedEvent);
            }

            if (this.resizeTimeout !== null) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.previousSize = this.currentSize;
                this.currentSize = this.isMobile() ? 'mobile' : this.isDesktop() ? 'desktop' : 'desktop';
                this.windowResizing = false;
                this.resizeTimeout = null;
                this.originalWidth = window.innerWidth;
                this.originalHeight = window.innerHeight;
                window.dispatchEvent(this.resizeFinishedEvent);

            }, 500);

        }
    }

    freeze() {
        let scrollingEl = window.document.scrollingElement || window.document.body || window.document.documentElement;
        scrollingEl.style.overflow = 'hidden';
    }

    unFreeze() {
        let scrollingEl = window.document.scrollingElement || window.document.body || window.document.documentElement;

        scrollingEl.style.overflow = 'visible';
    }

    

}

export default new MSMediaQuery();