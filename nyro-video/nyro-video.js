const scriptUrls = {
    hls: 'https://cdn.jsdelivr.net/npm/hls.js@latest',
    ima3: '//imasdk.googleapis.com/js/sdkloader/ima3.js'
};
const scriptCallbacks = {};
const headDom = document.querySelector('head');
const loadScript = function(name, callback, callbackError) {
    if (scriptCallbacks[name] !== undefined) {
        // already started, loaded or error
        if (scriptCallbacks[name] === true) {
            callback(name);
        } else if (scriptCallbacks[name] === false) {
            callbackError(name);
        } else {
            scriptCallbacks[name].push({
                ok: callback,
                ko: callbackError
            });
        }
        return;
    }

    scriptCallbacks[name] = [];
    scriptCallbacks[name].push({
        ok: callback,
        ko: callbackError
    });

    var script = document.createElement('script');
    script.async = 1;

    script.onload = script.onreadystatechange = function(_, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort) {
                scriptCallbacks[name].forEach(function(clb) {
                    clb.ok(name);
                })
                scriptCallbacks[name] = true;
            }
        }
    };

    script.onerror = function(e) {
        scriptCallbacks[name].forEach(function(clb) {
            clb.ko(name);
        })
        scriptCallbacks[name] = false;
    };

    script.src = scriptUrls[name];
    headDom.appendChild(script);
};

const canPlayNativeHls = !!document.createElement('video').canPlayType('application/vnd.apple.mpegURL');

let templateFullyInserted = false;
const template = document.createElement('template'),
    templateOnce = document.createElement('template');

template.innerHTML = `<div class="nyroVideo">
<div class="nyroVideoContent">
    <div class="nyroVideoSeeking">
        <span class="nyroVideoSpinner"></span>
    </div>
    <video><video>
</div>
<div class="nyroVideoAd"></div>
</div>`;

templateOnce.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
<symbol id="nyroVideoIcon-exitFullscreen" viewBox="0 0 448 512">
    <path d="M436 192H312c-13.3 0-24-10.7-24-24V44c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v84h84c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm-276-24V44c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v84H12c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24zm0 300V344c0-13.3-10.7-24-24-24H12c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-84h84c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12H312c-13.3 0-24 10.7-24 24v124c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12z"></path>
</symbol>
<symbol id="nyroVideoIcon-fullscreen" viewBox="0 0 448 512">
    <path d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z"></path>
</symbol>
<symbol id="nyroVideoIcon-play" viewBox="0 0 448 512">
    <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
</symbol>
<symbol id="nyroVideoIcon-pause" viewBox="0 0 448 512">
    <path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path>
</symbol>
<symbol id="nyroVideoIcon-volume-down" viewBox="0 0 576 512">
    <path d="M256 88.017v335.964c0 21.438-25.943 31.998-40.971 16.971L126.059 352H24c-13.255 0-24-10.745-24-24V184c0-13.255 10.745-24 24-24h102.059l88.971-88.954c15.01-15.01 40.97-4.49 40.97 16.971zM384 256c0-33.717-17.186-64.35-45.972-81.944-15.079-9.214-34.775-4.463-43.992 10.616s-4.464 34.775 10.615 43.992C314.263 234.538 320 244.757 320 256a32.056 32.056 0 0 1-13.802 26.332c-14.524 10.069-18.136 30.006-8.067 44.53 10.07 14.525 30.008 18.136 44.53 8.067C368.546 316.983 384 287.478 384 256z"></path>
</symbol>
<symbol id="nyroVideoIcon-volume-off" viewBox="0 0 576 512">
    <path d="M256 88.017v335.964c0 21.438-25.943 31.998-40.971 16.971L126.059 352H24c-13.255 0-24-10.745-24-24V184c0-13.255 10.745-24 24-24h102.059l88.971-88.954c15.01-15.01 40.97-4.49 40.97 16.971z"></path>
</symbol>
<symbol id="nyroVideoIcon-volume-up" viewBox="0 0 576 512">
    <path d="M256 88.017v335.964c0 21.438-25.943 31.998-40.971 16.971L126.059 352H24c-13.255 0-24-10.745-24-24V184c0-13.255 10.745-24 24-24h102.059l88.971-88.954c15.01-15.01 40.97-4.49 40.97 16.971zm182.056-77.876C422.982.92 403.283 5.668 394.061 20.745c-9.221 15.077-4.473 34.774 10.604 43.995C468.967 104.063 512 174.983 512 256c0 73.431-36.077 142.292-96.507 184.206-14.522 10.072-18.129 30.01-8.057 44.532 10.076 14.528 30.016 18.126 44.531 8.057C529.633 438.927 576 350.406 576 256c0-103.244-54.579-194.877-137.944-245.859zM480 256c0-68.547-36.15-129.777-91.957-163.901-15.076-9.22-34.774-4.471-43.994 10.607-9.22 15.078-4.471 34.774 10.607 43.994C393.067 170.188 416 211.048 416 256c0 41.964-20.62 81.319-55.158 105.276-14.521 10.073-18.128 30.01-8.056 44.532 6.216 8.96 16.185 13.765 26.322 13.765a31.862 31.862 0 0 0 18.21-5.709C449.091 377.953 480 318.938 480 256zm-96 0c0-33.717-17.186-64.35-45.972-81.944-15.079-9.214-34.775-4.463-43.992 10.616s-4.464 34.775 10.615 43.992C314.263 234.538 320 244.757 320 256a32.056 32.056 0 0 1-13.802 26.332c-14.524 10.069-18.136 30.006-8.067 44.53 10.07 14.525 30.008 18.136 44.53 8.067C368.546 316.983 384 287.478 384 256z"></path>
</symbol>
<symbol id="nyroVideoIcon-download" viewBox="0 0 512 512">
    <path d="m358.40002,230.4l-102.40001,102.40001l-102.40001,-102.40001l64,0l0,-153.60001l76.8,0l0,153.60001l64,0zm-102.40001,102.40001l-192.00001,0l0,102.40001l384.00002,0l0,-102.40001l-192.00001,0zm166.40001,51.2l-51.2,0l0,-25.6l51.2,0l0,25.6z"></path>
</symbol>
</svg>

<style>
:host {
    outline: none;
    --normal-color: #fff;
    --progress-color: red;
    --bar-background-color: rgba(255, 255, 255, 0.3);
}
nyro-video {
    outline: none;
    --normal-color: #fff;
    --progress-color: red;
    --bar-background-color: rgba(255, 255, 255, 0.3);
}
.nyroVideo {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.nyroVideoContent, .nyroVideoAd {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}
.nyroVideoContent video {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.nyroVideoAd {
    display: none;
}

.nyroVideoSeeking {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    color: var(--normal-color);
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms, visibility 300ms;
}
.nyroVideoSeeking .nyroVideoIcon {
    width: 20%;
    height:20%;
    min-width: 50px;
    min-height: 50px;
}
.seeking .nyroVideoSeeking {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    visibility: visible;
}
.seeking .nyroVideoSpinner {
    position: relative;
    width: 100px;
    height: 100px;
}
.seeking .nyroVideoSpinner:before, .seeking .nyroVideoSpinner:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #fff;
    opacity: 0.6;
    -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
    animation: sk-bounce 2.0s infinite ease-in-out;
}
.seeking .nyroVideoSpinner:after {
    -webkit-animation-delay: -1.0s;
    animation-delay: -1.0s;
}
@-webkit-keyframes sk-bounce {
    0%, 100% { -webkit-transform: scale(0.0) }
    50% { -webkit-transform: scale(1.0) }
}
@keyframes sk-bounce {
    0%, 100% {
        transform: scale(0.0);
        -webkit-transform: scale(0.0);
    } 50% {
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
    }
}
.nyroVideoControls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    color: var(--normal-color);
    background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%);
    background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0.65) 100%);
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0.65) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#a6000000',GradientType=0 );
    transition: transform 300ms;
}
.hideUi .nyroVideoControls {
    transform: translate(0, 100%);
}
.nyroVideoProgress {
    position: relative;
    width: 100%;
    height: 16px;
    cursor: pointer;
}
.nyroVideoProgress:before {
    content: '';
    position: absolute;
    height: 4px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bar-background-color);
}
.nyroVideoProgress div {
    position: absolute;
    height: 4px;
    left: 0;
    bottom: 0;
}
.nyroVideoProgress .nyroVideoProgressLoad {
    background: var(--bar-background-color);
}
.nyroVideoProgress .nyroVideoProgressRead {
    background: var(--progress-color);
}
.nyroVideoControls button {
    height: 30px;
    padding: 2px 10px;
    background: transparent;
    color: var(--normal-color);
    border: none;
    cursor: pointer;
}
.nyroVideoIcon {
    stroke: var(--normal-color);
    fill: var(--normal-color);
    height: 22px;
    width: 22px;
    opacity: 0.8;
    transition: opacity 300ms;
}
button:hover .nyroVideoIcon {
    opacity: 1;
}
.nyroVideoPlayPause .nyroVideoIcon {
    width: 18px;
    height: 18px;
    margin-left: 3px;
}
.nyroVideoPause, .playing .nyroVideoPlay {
    display: none;
}
.playing .nyroVideoPause {
    display: block;
}
.nyroVideoUnmute, .muted .nyroVideoMute {
    display: none;
}
.muted .nyroVideoUnmute {
    display: block;
}
.muted .nyroVideoVolumeCursor {
    width: 0 !important;
}
.nyroVideoIcon-volume-down, .volume-low .nyroVideoIcon-volume-up {
    display: none;
}
.volume-low .nyroVideoIcon-volume-down {
    display: inline;
}
:host(.fullscreened) .nyroVideoEnterFullscreen {
    display: none;
}
.nyroVideoExitFullscreen, .fullscreened .nyroVideoEnterFullscreen {
    display: none;
}
:host(.fullscreened) .nyroVideoExitFullscreen {
    display: block;
}
.fullscreened .nyroVideoExitFullscreen {
    display: block;
}
:host(.fullscreened) .nyroVideo {
    height: 100% !important;
    padding-top: 0 !important;
}
.fullscreened .nyroVideo {
    height: 100% !important;
    padding-top: 0 !important;
}
:host(.fullscreened) {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
}
nyro-video.fullscreened {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
}
.nyroVideoVolume {
    display: flex;
    align-items: center;
}
.nyroVideoVolumeBar {
    position: relative;
    height: 4px;
    width: 50px;
    background: var(--bar-background-color);
    cursor: pointer;
    max-width: 0;
    transition: max-width 300ms;
}
.nyroVideoVolume:hover .nyroVideoVolumeBar {
    max-width: 50px;
}
.nyroVideoVolumeCursor {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background: var(--normal-color);
}
.nyroVideoProgress .nyroVideoProgressRead:after, .nyroVideoVolumeCursor:after {
    content: '';
    position: absolute;
    right: -5px;
    top: -3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--progress-color);
    transform: scale(0, 0);
    transition: transform 300ms;
}
.nyroVideoVolumeCursor:after {
    background: var(--normal-color);
}
.nyroVideoProgress:hover .nyroVideoProgressRead:after,
.nyroVideoVolume:hover .nyroVideoVolumeCursor:after {
    transform: scale(1, 1);
}
.nyroVideoCurrentTime, .nyroVideoRemainingTime {
    padding: 0 5px 0 10px;
    opacity: 0.9;
}
.nyroVideoDuration {
    padding: 0 10px 0 5px;
    opacity: 0.9;
}
.nyroVideoTimeDiviser {
    opacity: 0.9;
}
.nyroVideoQuality {
    position: relative;
    width: 40px;
    text-align: center;
    cursor: pointer;
}
.nyroVideoQuality strong {
    opacity: 0.8;
    transition: opacity 300ms;
}
.nyroVideoQuality:hover strong {
    opacity: 1;
}
.nyroVideoQuality ul {
    position: absolute;
    bottom: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    padding: 0;
    margin: 0;
    list-style-type: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms, visibility 300ms;
}
.nyroVideoQuality:hover ul {
    opacity: 1;
    visibility: visible;
}
.hideUi .nyroVideoQuality ul {
    opacity: 0;
    visibility: hidden;
}
.nyroVideoQuality li {
    padding: 0;
    margin: 0;
}
.nyroVideoQuality button {
    line-height: 1.7;
    height: auto;
    width: 100%;
}
.nyroVideoQuality .using {
    background: rgba(0, 0, 0, 0.3);
}
.nyroVideoQuality button:hover, .nyroVideoQuality .selected {
    color: var(--progress-color);
}
.nyroVideoTimeDiviser:after {
    content: ' / ';
}
.nyroVideoSpacer {
    flex-grow: 1;
}
.nyroVideoAdVolume {
    position: absolute;
    top: 20px;
    left: 20px;
}
.nyroVideoAdVolume button {
    line-height: 30px;
    background: rgba(0, 0, 0, 0.8);
    color: var(--normal-color);;
    border: none;
    cursor: pointer;
}
</style>`;

let evtSupportsPassive = false;
try {
    const opts = Object.defineProperty({}, 'passive', {
        get: function() {
            evtSupportsPassive = true;
        }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
} catch (e) {}

const evtPassivePrm = evtSupportsPassive ? {
    passive: true
} : false;

const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints,
    evtPointerStart = isTouch ? 'touchstart' : 'mousedown',
    evtPointerMove = isTouch ? 'touchmove' : 'mousemove',
    evtPointerEnd = isTouch ? 'touchend' : 'mouseup';

const videoEvts = [
    'canplay',
    'durationchange',
    'ended',
    'error',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'pause',
    'play',
    'playing',
    'progress',
    'seeked',
    'seeking',
    'timeupdate',
    'volumechange'
];

let 
    curClbPointerEnd,
    fsElement,
    fsClb = false,
    resizeRaf;

const str_pad_left = function(string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    },
    humanTime = function(time) {
        var seconds = parseInt(time),
            minutes = Math.floor(time / 60),
            seconds = seconds - minutes * 60;

        return str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
    },
    clbPointerEnd = function(e) {
        if (curClbPointerEnd) {
            curClbPointerEnd(e);
            curClbPointerEnd = false;
        }
        document.removeEventListener(evtPointerEnd, clbPointerEnd);
    },
    documentClbPointerEnd = function(clb) {
        if (curClbPointerEnd) {
            curClbPointerEnd();
            curClbPointerEnd = clb;
        } else {
            curClbPointerEnd = clb;
            document.addEventListener(evtPointerEnd, clbPointerEnd, evtPassivePrm);
        }
    },
    removeFullscreenClb = function() {
        document.removeEventListener('fullscreenchange', fsClb);
        document.removeEventListener('mozfullscreenchange', fsClb);
        document.removeEventListener('webkitfullscreenchange', fsClb);
        document.removeEventListener('msfullscreenchange', fsClb);
    },
    addFullscreenClb = function(clb) {
        fsClb = clb;
        document.addEventListener('fullscreenchange', clb);
        document.addEventListener('mozfullscreenchange', clb);
        document.addEventListener('webkitfullscreenchange', clb);
        document.addEventListener('msfullscreenchange', clb);
    },
    canFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen,
    getFullscreenElt = function() {
        if (document.fullscreenElement) {
            return document.fullscreenElement;
        } else if (document.mozFullScreenElement) {
            return document.mozFullScreenElement;
        } else if (document.webkitFullscreenElement) {
            return document.webkitFullscreenElement;
        } else if (document.msFullscreenElement) {
            return document.msFullscreenElement;
        }
    },
    makeFullScreen = function(element) {
        var isFullScreen = false;
        if (fsElement && fsElement == element) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fsElement = false;
            isFullScreen = false;
            removeFullscreenClb();
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen();
                isFullScreen = true;
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
                isFullScreen = true;
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
                isFullScreen = true;
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
                isFullScreen = true;
            }
            if (isFullScreen) {
                if (fsElement) {
                    element.classList.remove('fullscreened');
                    removeFullscreenClb();
                }
                fsElement = element;
                addFullscreenClb(function(e) {
                    if (fsElement != getFullscreenElt()) {
                        removeFullscreenClb();
                        element.exitFullscreen();
                    }
                });
            }
        }

        if (isFullScreen) {
            element.classList.add('fullscreened');
        } else {
            element.classList.remove('fullscreened');
        }

        return isFullScreen;
    },
    svgIcon = function(name, addClass) {
        return '<svg class="nyroVideoIcon nyroVideoIcon-'+name+(addClass ? ' '+addClass : '')+'" viewBox="0 0 100 100">'
                    +'<use width=100 height=100 xlink:href="#nyroVideoIcon-'+name+'"></use>'
                +'</svg>';
    },
    resizeClbs = [],
    addResizeClb = function(clb) {
        resizeClbs.push(clb);
    };


document.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.nodeName.toLowerCase() === 'nyro-video') {
        document.activeElement._keyDown(e);
    }
});
window.addEventListener('resize', function() {
    if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = requestAnimationFrame(function() {
        resizeClbs.forEach(function(clb) {
            clb();
        });
    });
}, evtPassivePrm);

window.NyroVideo = class extends HTMLElement {

    connectedCallback() {
        this._bubbleEvents = false;

        let clone = document.importNode(template.content, true);

        this._dom = {
            global: clone.querySelector('.nyroVideo'),
            content: clone.querySelector('.nyroVideoContent'),
            video: clone.querySelector('video'),
            ad: clone.querySelector('.nyroVideoAd')
        };

        videoEvts.forEach(function(evt) {
            this._dom.video.addEventListener(evt, this._onVideoEvt.bind(this), evtPassivePrm);
        }.bind(this));

        if (!isTouch) {
            this.addEventListener('mouseleave', function() {
                if (!this.paused) {
                    this._dom.content.classList.add('hideUi');
                }
            }.bind(this), evtPassivePrm);
            this.addEventListener('mouseenter', this._showUiTimer.bind(this), evtPassivePrm);
            this.addEventListener('mousemove', this._showUiTimer.bind(this), evtPassivePrm);
        }

        const poster = this.getAttribute('poster');
        if (poster) {
            this._dom.video.setAttribute('poster', poster);
        }

        this._src = this.getAttribute('src');
        if (!this._src) {
            console.warn('no src attribute found');
        }

        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', -1);
        }

        if (this.hasAttribute('muted')) {
            this.volume = 0;
            this.muted = true;
        }

        this._autoplay = this.hasAttribute('autoplay');

        if (this._autoplay) {
            this._dom.video.setAttribute('playsinline', '');
        }

        this._ads = this.getAttribute('ads');

        if (true || this._ads) {
            // Ads is not supported in shadow DOM, add insertOnce element
            // @see https://groups.google.com/forum/?hl=en-us#!topic/ima-sdk/OnwP__Od1UM
            // Always use Shadow DOM because of ads bug and Safaris SVG bug
            if (!templateFullyInserted) {
                headDom.insertBefore(document.importNode(templateOnce.content, true), headDom.firstChild);
                templateFullyInserted = true;
            }
            this.appendChild(clone);
        } else {
            this._shadow = this.attachShadow({
                mode: 'open'
            });
            this._shadow.appendChild(document.importNode(templateOnce.content, true));
            this._shadow.appendChild(clone);
        }

        if (this.hasAttribute('controls')) {
            this._initControls(this.getAttribute('controls'));
        }

        this._canPlay = false;
        this._setSrc();

        if (this._ads) {
            loadScript('ima3', this._resLoaded.bind(this), this._resError.bind(this));
        }

        this._tryAutoPlay();
    }

    static get observedAttributes() {
        return [
            'src',
            'poster'
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._dom || !this._dom.video) {
            return;
        }
        if (name === 'src') {
            this._src = newValue;
            this._setSrc(true);
        } else if (name === 'poster') {
            this._dom.video.setAttribute('poster', newValue);
        }
    }

    _setSrc(tryAutoplay) {
        if (this._src) {
            if (this._src.endsWith('.m3u8')) {
                loadScript('hls', this._resLoaded.bind(this), this._resError.bind(this));
            } else {
                this._dom.video.setAttribute('src', this._src);
            }

            if (tryAutoplay) {
                this._tryAutoPlay();
            }
        }
    }

    _showUiTimer() {
        this._dom.content.classList.remove('hideUi');
        this._hideUiTimer();
    }

    _hideUiTimer() {
        if (this._uiTimer) {
            clearTimeout(this._uiTimer);
        }
        this._uiTimer = setTimeout(function() {
            if (!this.paused && !this._hoverControls) {
                this._dom.content.classList.add('hideUi');
            }
            this._uiTimer = false;
        }.bind(this), 3000);
    }

    _initControls(controls) {
        const avlControls = [
            'progress',
            'playPause',
            'volume',
            'currentTime',
            'remainingTime',
            'timeDiviser',
            'duration',
            'quality',
            'fullscreen',
            'download',
            'spacer'
        ];
        if (controls) {
            controls = controls.split(',');
        } else {
            controls = [
                'progress',
                'playPause',
                'volume',
                'currentTime',
                'timeDiviser',
                'duration',
                'spacer',
                'quality',
                'fullscreen'
            ];
        }

        if (controls.length === 0) {
            return;
        }

        var html = '<div class="nyroVideoControls">';
        var htmlAd = '';
        controls.forEach(function(control) {
            switch (control) {
                case 'progress':
                    html += '<div class="nyroVideoProgress"><div class="nyroVideoProgressLoad"></div><div class="nyroVideoProgressRead"></div></div>';
                    break;
                case 'playPause':
                    html += '<div class="nyroVideoPlayPause"><button class="nyroVideoPlay">'+svgIcon('play')+'</button><button class="nyroVideoPause">'+svgIcon('pause')+'</button></div>';
                    break;
                case 'volume':
                    html += '<div class="nyroVideoVolume"><button class="nyroVideoMute">'+svgIcon('volume-down')+svgIcon('volume-up')+'</button><button class="nyroVideoUnmute">'+svgIcon('volume-off')+'</button>';
                    if (!isTouch) {
                        html += '<div class="nyroVideoVolumeBar"><div class="nyroVideoVolumeCursor"></div></div>';
                    }
                    html += '</div>';
                    htmlAd += '<div class="nyroVideoAdVolume"><button class="nyroVideoMute">'+svgIcon('volume-up')+'</button><button class="nyroVideoUnmute">'+svgIcon('volume-off')+'</button></div>';
                    break;
                case 'currentTime':
                    html += '<div class="nyroVideoCurrentTime"></div>';
                    break;
                case 'remainingTime':
                    html += '<div class="nyroVideoRemainingTime"></div>';
                    break;
                case 'timeDiviser':
                    html += '<div class="nyroVideoTimeDiviser"></div>';
                    break;
                case 'duration':
                    html += '<div class="nyroVideoDuration"></div>';
                    break;
                case 'quality':
                    html += '<div class="nyroVideoQuality"></div>';
                    break;
                case 'fullscreen':
                    if (canFullScreen) {
                        html += '<div class="nyroVideoFullscreen"><button class="nyroVideoEnterFullscreen">'+svgIcon('fullscreen')+'</button><button class="nyroVideoExitFullscreen">'+svgIcon('exitFullscreen')+'</button></div>';
                    }
                    break;
                case 'download':
                    html += '<div class="nyroVideoDownload"><button class="nyroVideoDownloadBut">'+svgIcon('download')+'</button></div>';
                    break;
                case 'spacer':
                    html += '<div class="nyroVideoSpacer"></div>';
                    break;
                default:
                    throw new Error('control ' + control + ' not recognized.');
                    break;
            }
        });
        html += '</div>';

        if (htmlAd) {
            this._dom.ad.innerHTML += htmlAd;
        }

        this._dom.video.insertAdjacentHTML('afterend', html);
        this._dom.controls = this._dom.global.querySelector('.nyroVideoControls');
        this._dom.subConstrols = {};

        if (isTouch) {
            this._dom.video.addEventListener('touchend', function(e) {
                e.preventDefault();
                if (this._dom.content.classList.contains('hideUi')) {
                    this._showUiTimer();
                } else {
                    this.toggle();
                }
            }.bind(this));
        } else {
            this._dom.controls.addEventListener('mouseenter', function() {
                this._hoverControls = true;
            }.bind(this), evtPassivePrm);
            this._dom.controls.addEventListener('mouseleave', function() {
                this._hoverControls = false;
                this._hideUiTimer();
            }.bind(this), evtPassivePrm);
            this._dom.video.addEventListener('click', function(e) {
                e.preventDefault();
                this.toggle();
            }.bind(this));
        }

        if (controls.indexOf('progress') !== -1) {
            this._dom.subConstrols.progress = this._dom.global.querySelectorAll('.nyroVideoProgress');
            this._dom.subConstrols.progress_load = this._dom.global.querySelectorAll('.nyroVideoProgress .nyroVideoProgressLoad');
            this._dom.subConstrols.progress_read = this._dom.global.querySelectorAll('.nyroVideoProgress .nyroVideoProgressRead');

            const moveProgressBar = function(e, el) {
                var duration = this.duration;
                if (!e || !duration || (e.touches && e.touches.length === 0)) {
                    return;
                }
                //e.preventDefault();
                if (!el) {
                    el = this._dom.mousemove;
                }
                if (!el) {
                    return;
                }
                var rect = el.getBoundingClientRect(),
                    evtX = e.touches ? e.touches[0].pageX : e.pageX,
                    offsetX = evtX - rect.left;
                if (offsetX < 0) {
                    offsetX = 0;
                } else if (offsetX > rect.width) {
                    offsetX = rect.width;
                }
                var pc = offsetX / rect.width;
                this._forcedCurentTime = duration * pc;
                this._updateControls('time');
                this.currentTime = duration * pc;
            }.bind(this);
            const moveProgressBarEnd = function() {
                this._forcedCurentTime = false;
                if (!this._progressPaused) {
                    this.play();
                }
            }.bind(this);
            this._dom.subConstrols.progress.forEach(function(el) {
                el.addEventListener(evtPointerStart, function(e) {
                    this._progressPaused = this.paused;
                    if (!this._progressPaused) {
                        this.pause();
                    }
                    moveProgressBar(e, el);
                    this._dom.mousemove = el;
                    this._dom.content.addEventListener(evtPointerMove, moveProgressBar, evtPassivePrm);
                    documentClbPointerEnd(function(e) {
                        this._dom.content.removeEventListener(evtPointerMove, moveProgressBar);
                        moveProgressBar(e);
                        moveProgressBarEnd();
                    }.bind(this));
                }.bind(this), evtPassivePrm);
                el.addEventListener(evtPointerEnd, function(e) {
                    this._dom.content.removeEventListener(evtPointerMove, moveProgressBar);
                    this._dom.mousemove = false;
                    moveProgressBar(e, el);
                    moveProgressBarEnd();
                }.bind(this));
            }.bind(this), evtPassivePrm);
        }

        if (controls.indexOf('playPause') !== -1) {
            this._dom.subConstrols.playPause = this._dom.global.querySelectorAll('.nyroVideoPlayPause');
            this._dom.subConstrols.playPause_play = this._dom.global.querySelectorAll('.nyroVideoPlayPause .nyroVideoPlay');
            this._dom.subConstrols.playPause_pause = this._dom.global.querySelectorAll('.nyroVideoPlayPause .nyroVideoPause');

            this._dom.subConstrols.playPause_play.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.play();
                    this.focus();
                }.bind(this));
            }.bind(this));
            this._dom.subConstrols.playPause_pause.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.pause();
                    this.focus();
                }.bind(this));
            }.bind(this));
        }

        if (controls.indexOf('volume') !== -1) {
            this._dom.subConstrols.volume = this._dom.global.querySelectorAll('.nyroVideoVolume');
            this._dom.subConstrols.volume_mute = this._dom.global.querySelectorAll('.nyroVideoVolume .nyroVideoMute, .nyroVideoAdVolume .nyroVideoMute');
            this._dom.subConstrols.volume_unmute = this._dom.global.querySelectorAll('.nyroVideoVolume .nyroVideoUnmute, .nyroVideoAdVolume .nyroVideoUnmute');
            this._dom.subConstrols.volume_bar = this._dom.global.querySelectorAll('.nyroVideoVolume .nyroVideoVolumeBar');
            this._dom.subConstrols.volume_cursor = this._dom.global.querySelectorAll('.nyroVideoVolume .nyroVideoVolumeCursor');

            this._dom.subConstrols.volume_mute.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.muted = true;
                    this.focus();
                }.bind(this));
            }.bind(this));
            this._dom.subConstrols.volume_unmute.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.muted = false;
                    this.focus();
                }.bind(this));
            }.bind(this));

            if (!isTouch) {
                const moveVolumeBar = function(e, el) {
                    if (!e) {
                        return;
                    }
                    //e.preventDefault();
                    if (!el) {
                        el = this._dom.mousemove;
                    }
                    if (!el) {
                        return;
                    }
                    var rect = el.getBoundingClientRect(),
                        offsetX = e.pageX - rect.left;
                    if (offsetX < 0) {
                        offsetX = 0;
                    } else if (offsetX > rect.width) {
                        offsetX = rect.width;
                    }
                    var pc = offsetX / rect.width;
                    this.volume = pc;
                }.bind(this);
                this._dom.subConstrols.volume_bar.forEach(function(el) {
                    el.addEventListener(evtPointerStart, function(e) {
                        moveVolumeBar(e, el);
                        this._dom.mousemove = el;
                        this._dom.content.addEventListener(evtPointerMove, moveVolumeBar, evtPassivePrm);
                        documentClbPointerEnd(function(e) {
                            this._dom.content.removeEventListener(evtPointerMove, moveVolumeBar);
                            moveVolumeBar(e);
                        }.bind(this));
                    }.bind(this), evtPassivePrm);
                    el.addEventListener(evtPointerEnd, function(e) {
                        this._dom.content.removeEventListener(evtPointerMove, moveVolumeBar);
                        this._dom.mousemove = false;
                        moveVolumeBar(e, el);
                    }.bind(this));
                }.bind(this), evtPassivePrm, evtPassivePrm);
            }

            this._updateControls('volume');
        }

        if (controls.indexOf('currentTime') !== -1) {
            this._dom.subConstrols.currentTime = this._dom.global.querySelectorAll('.nyroVideoCurrentTime');
        }

        if (controls.indexOf('remainingTime') !== -1) {
            this._dom.subConstrols.remainingTime = this._dom.global.querySelectorAll('.nyroVideoRemainingTime');
        }

        if (controls.indexOf('duration') !== -1) {
            this._dom.subConstrols.duration = this._dom.global.querySelectorAll('.nyroVideoDuration');
        }

        if (controls.indexOf('quality') !== -1) {
            this._dom.subConstrols.quality = this._dom.global.querySelectorAll('.nyroVideoQuality');
        }

        if (controls.indexOf('fullscreen') !== -1) {
            this._dom.subConstrols.fullscreen = this._dom.global.querySelectorAll('.nyroVideoFullscreen');
            this._dom.subConstrols.fullscreen_enter = this._dom.global.querySelectorAll('.nyroVideoFullscreen .nyroVideoEnterFullscreen');
            this._dom.subConstrols.fullscreen_exit = this._dom.global.querySelectorAll('.nyroVideoFullscreen .nyroVideoExitFullscreen');

            this._dom.subConstrols.fullscreen_enter.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.fullscreen();
                    this.focus();
                }.bind(this));
            }.bind(this));
            this._dom.subConstrols.fullscreen_exit.forEach(function(el) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    this.exitFullscreen();
                    this.focus();
                }.bind(this));
            }.bind(this));
        }

        if (controls.indexOf('download') !== -1) {
            this._dom.subConstrols.downloadBut = this._dom.global.querySelectorAll('.nyroVideoDownloadBut');

            if (this._dom.subConstrols.downloadBut && this._dom.subConstrols.downloadBut.length) {
                this._dom.subConstrols.downloadBut.forEach(function(el) {
                    el.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (this._src) {
                            const a = document.createElement('A');
                            a.href = this._src;
                            a.download = this._src.substr(this._src.lastIndexOf('/') + 1);
                            const posQuestion = a.download.lastIndexOf('?');
                            if (posQuestion > 0) {
                                a.download = a.download.substr(0, posQuestion);
                            }
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }.bind(this));
                }.bind(this));
            }
        }
    }

    _onVideoEvt(e) {
        switch (e.type) {
            case 'loadedmetadata':
            case 'loadeddata':
            case 'durationchange':
                if (!this._videoWidthReceived) {
                    var w = this._dom.video.videoWidth;
                    if (w) {
                        this._videoWidthReceived = true;
                        if (!this.hasAttribute('discard-aspect-ratio')) {
                            var h = this._dom.video.videoHeight,
                                ratio = 100 * h / w;
                            this._dom.global.style.height = '0';
                            this._dom.global.style.paddingTop = ratio + '%';
                            this.style.height = 'auto';
                            this._resizeIma3();
                        }
                        this._canPlay = true;
                        this._tryAutoPlay();
                    }
                }
                this._updateControls('duration');
                break;
            case 'timeupdate':
                this._updateControls('time');
                break;
            case 'progress':
                this._updateControls('load');
                break;
            case 'play':
            case 'pause':
                this._updateControls('state');
                break;
            case 'volumechange':
                this._updateControls('volume');
                break;
            case 'seeking':
                this._dom.content.classList.add('seeking');
                break;
            case 'seeked':
                this._dom.content.classList.remove('seeking');
                break;
            case 'ended':
                if (this._ima3 && this._ima3.loader) {
                    this._ima3.loader.contentComplete();
                } else {
                    this.currentTime = 0;
                }
                break;
        }

        if (this._bubbleEvents) {
            this.dispatchEvent(new e.constructor(e.type, e));
        }
    }

    set bubbleEvents(value) {
        this._bubbleEvents = !!value;
    }

    _updateControls(type, clb) {
        if (!this._dom.controls || !this._dom.subConstrols) {
            if (clb) {
                clb();
            }
            return;
        }
        switch (type) {
            case 'duration':
                if (this._dom.subConstrols.duration) {
                    const durationText = humanTime(this.duration);
                    this._dom.subConstrols.duration.forEach(function(el) {
                        el.textContent = durationText;
                    });
                }

                this._updateControls('time');
                break;
            case 'time':
                const duration = this.duration,
                    current = this._forcedCurentTime || this.currentTime;
                if (this._dom.subConstrols.progress_read) {
                    const pcTime = 100 * current / duration;
                    this._dom.subConstrols.progress_read.forEach(function(el) {
                        el.style.width = pcTime + '%';
                    });
                }
                if (this._dom.subConstrols.currentTime) {
                    const currentText = humanTime(current);
                    this._dom.subConstrols.currentTime.forEach(function(el) {
                        el.textContent = currentText;
                    });
                }
                if (this._dom.subConstrols.remainingTime) {
                    const remainingText = '-' + humanTime(duration - current);
                    this._dom.subConstrols.remainingTime.forEach(function(el) {
                        el.textContent = remainingText;
                    });
                }
                break;
            case 'load':
                if (this._dom.subConstrols.progress_load) {
                    var loaded = 0;
                    if (this._dom.video.buffered && this._dom.video.buffered.length) {
                        for (var i = 0; i < this._dom.video.buffered.length; i++) {
                            loaded = Math.max(loaded, this._dom.video.buffered.end(i));
                        }
                    }

                    var pcLoaded = 100 * loaded / this.duration;
                    this._dom.subConstrols.progress_load.forEach(function(el) {
                        el.style.width = pcLoaded + '%';
                    });
                }
                break;
            case 'state':
                if (this._dom.video.paused) {
                    this._dom.content.classList.remove('playing');
                    this._dom.content.classList.remove('hideUi');
                } else {
                    this._dom.content.classList.add('playing');
                    this._hideUiTimer();
                }
                break;
            case 'volume':
                var volume = this.volume,
                    muted = this.muted;
                if (muted) {
                    this._dom.global.classList.add('muted');
                } else {
                    this._dom.global.classList.remove('muted');
                    if (volume < 0.3) {
                        this._dom.global.classList.add('volume-low');
                    } else {
                        this._dom.global.classList.remove('volume-low');
                    }
                    if (this._dom.subConstrols.volume_cursor) {
                        this._dom.subConstrols.volume_cursor.forEach(function(el) {
                            el.style.width = (volume * 100) + '%';
                        });
                    }
                }
                break;
        }

        if (clb) {
            clb();
        }
    }

    _resLoaded(name) {
        if (name === 'hls') {
            if (Hls.isSupported()) {
                this._canPlay = true;
                this._hls = new Hls();
                this._hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    if (!this._dom.subConstrols.quality) {
                        return;
                    }
                    if (this._hls.levels.length > 1) {
                        let lines = [];
                        lines.push('<li><button data-index="-1" class="selected">auto</button></li>');
                        this._hls.levels.forEach(function(level, idx) {
                            lines.push('<li><button data-index="' + idx + '">' + level.name + '</button></li>');
                        });
                        let html = '<ul>' + lines.reverse().join('') + '</ul>';
                        html += '<strong>auto</strong>';
                        this._dom.subConstrols.quality.forEach(function(el) {
                            el.innerHTML = html;
                        });
                        this._dom.subConstrols.quality_display = this._dom.global.querySelectorAll('.nyroVideoQuality strong');
                        this._dom.subConstrols.quality_buttons = this._dom.global.querySelectorAll('.nyroVideoQuality button');

                        this._dom.subConstrols.quality_buttons.forEach(function(el) {
                            el.addEventListener('click', function(e) {
                                this.focus();
                                if (!this._hls) {
                                    return;
                                }
                                e.preventDefault();
                                const newLevel = parseInt(el.dataset.index);
                                if (newLevel === this._hls.currentLevel || (newLevel === -1 && this._hls.autoLevelEnabled)) {
                                    return;
                                }
                                this._hls.currentLevel = newLevel;

                                if (this._dom.subConstrols.quality_buttons) {
                                    this._dom.subConstrols.quality_buttons.forEach(function(but) {
                                        if (but === el) {
                                            but.classList.add('selected');
                                        } else {
                                            but.classList.remove('selected');
                                        }
                                    });
                                }
                                if (this._dom.subConstrols.quality_display) {
                                    this._dom.subConstrols.quality_display.forEach(function(display) {
                                        display.textContent = el.textContent;
                                    });
                                }

                            }.bind(this));
                        }.bind(this));

                    } else {
                        this._dom.subConstrols.quality.forEach(function(el) {
                            el.style.display = 'none';
                        });
                    }
                }.bind(this));
                this._hls.on(Hls.Events.LEVEL_SWITCHED, function(level, data) {
                    if (this._dom.subConstrols.quality_buttons) {
                        this._dom.subConstrols.quality_buttons.forEach(function(el) {
                            if (el.dataset.index == data.level) {
                                el.classList.add('using');
                            } else {
                                el.classList.remove('using');
                            }
                        });
                    }
                }.bind(this));
                this._hls.loadSource(this._src);
                this._hls.attachMedia(this._dom.video);

                this._tryAutoPlay();

            } else if (canPlayNativeHls) {
                this._dom.video.src = this._src;
            } else {
                throw new Error('Impossible to read '.this._src);
            }
        } else if (name === 'ima3') {
            this._ima3 = {
                container: new google.ima.AdDisplayContainer(this._dom.ad, this._dom.video)
            };
            this._ima3.loader = new google.ima.AdsLoader(this._ima3.container);

            this._ima3.loader.addEventListener(
                google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                function(adsManagerLoadedEvent) {
                    // Get the ads manager.
                    this._ima3.renderingSettings = new google.ima.AdsRenderingSettings();
                    this._ima3.renderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

                    // Preloading give some error on mobile
                    this._ima3.renderingSettings.enablePreloading = !isTouch;

                    this._ima3.manager = adsManagerLoadedEvent.getAdsManager(this._dom.video, this._ima3.renderingSettings);

                    addResizeClb(function() {
                        this._resizeIma3();
                    }.bind(this));

                    // Add listeners to the required events.
                    this._ima3.manager.addEventListener(
                        google.ima.AdErrorEvent.Type.AD_ERROR,
                        this._onAdError.bind(this));
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                        this._onAdContentPauseRequested.bind(this));
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                        this._onAdContentResumeRequested.bind(this));
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                        this._onAdEvent.bind(this));

                    // Listen to any additional events, if necessary.
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.LOADED,
                        this._onAdEvent.bind(this));
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.STARTED,
                        this._onAdEvent.bind(this));
                    this._ima3.manager.addEventListener(
                        google.ima.AdEvent.Type.COMPLETE,
                        this._onAdEvent.bind(this));

                    if (this._autplayOnAdLoad) {
                        this._autplayOnAdLoad = false;
                        this.play();
                    } else {
                        this._tryAutoPlay();
                    }

                }.bind(this),
                false);

            this._ima3.loader.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                this._onAdError.bind(this),
                false);

            this._ima3.request = new google.ima.AdsRequest();
            this._ima3.request.adTagUrl = this._ads;

            this._ima3.request.linearAdSlotWidth = this.offsetWidth;
            this._ima3.request.linearAdSlotHeight = this.offsetHeight;

            this._ima3.request.nonLinearAdSlotWidth = this.offsetWidth;
            this._ima3.request.nonLinearAdSlotHeight = 150;

            if (this._autoplay) {
                this._tryAutoPlay();
            } else {
                this._ima3.loader.requestAds(this._ima3.request);
            }
        }
    }

    _resError(name) {
        if (name === 'hls') {
            throw new Error('HLS not supported and error while loading library.');
        } else if (name === 'ima3') {
            this._ima3 = false;
            this._ads = false;
            this._tryAutoPlay();
        }
    }

    _onAdError(adErrorEvent) {
        console.log(adErrorEvent.getError());
        this._ima3.manager.destroy();
        this._ima3 = false;
        this._ads = false;
        this._dom.ad.style.display = 'none';

        if (adErrorEvent.getError().getType() === google.ima.AdError.Type.AD_PLAY) {
            this.play();
        } else if (adErrorEvent.getError().getType() === google.ima.AdError.Type.AD_LOAD) {
            this._tryAutoPlay();
        }
    }

    _onAdContentPauseRequested() {
        this._dom.video.pause();

        this._dom.ad.style.display = 'block';
    }

    _onAdContentResumeRequested(e) {
        if (this.ended) {
            this.currentTime = 0;
        } else {
            this._dom.video.play();
            this._updateControls('volume');
        }

        this._dom.ad.style.display = 'none';
    }

    _onAdEvent(adEvent) {
        // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
        // don't have ad object associated.
        var ad = adEvent.getAd();
        switch (adEvent.type) {
            case google.ima.AdEvent.Type.LOADED:
                // This is the first event sent for an ad - it is possible to
                // determine whether the ad is a video ad or an overlay.
                if (!ad.isLinear()) {
                    // Position AdDisplayContainer correctly for overlay.
                    // Use ad.width and ad.height.
                    this._dom.video.play();
                } else {
                    this._ima3.manager.setVolume(this.muted ? 0 : this.volume);
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                // This event indicates the ad has started - the video player
                // can adjust the UI, for example display a pause button and
                // remaining time.
                if (ad.isLinear()) {

                    // For a linear ad, a timer can be started to poll for
                    // the remaining time.
                    this._ima3.intervalTimer = setInterval(
                        function() {
                            var remainingTime = this._ima3.manager.getRemainingTime();
                            // @todo show it
                        }.bind(this),
                        300); // every 300ms
                    this._ima3.playing = true;
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
                // This event indicates the ad has finished - the video player
                // can perform appropriate UI actions, such as removing the timer for
                // remaining time detection.
                if (ad.isLinear()) {
                    clearInterval(this._ima3.intervalTimer);
                    this._ima3.playing = false;
                }
                break;
        }
    }

    _tryAutoPlay() {
        if (!this._autoplay ||
            !this._canPlay ||
            !this._src ||
            (this._ads && !this._ima3)
        ) {
            return;
        }
        // Everything is setup and autoplay was requested, try it
        this._autoplay = false; // to be sure to come only once here

        this._dom.video.play()
            .then(function() {
                // Play on current state

                this._dom.video.pause();
                this._dom.video.currentTime = 0;
                if (this._ima3) {
                    this._autplayOnAdLoad = true;
                    this._ima3.request.setAdWillAutoPlay(true);
                    this._ima3.request.setAdWillPlayMuted(this.muted);
                    this._ima3.loader.requestAds(this._ima3.request);
                } else {
                    this.play();
                }
            }.bind(this))
            .catch(function() {
                // Autoplay did not work, try as muted if not set
                if (!this.muted) {
                    this.volume = 0;
                    this.muted = true;
                    this._dom.video.play()
                        .then(function() {
                            // autoplay work as muted
                            this._dom.video.pause();
                            this._dom.video.currentTime = 0;

                            if (this._ima3) {
                                this._autplayOnAdLoad = true;
                                this._ima3.request.setAdWillAutoPlay(true);
                                this._ima3.request.setAdWillPlayMuted(true);
                                this._ima3.loader.requestAds(this._ima3.request);
                            } else {
                                this.play();
                            }
                        }.bind(this))
                        .catch(function() {

                        }.bind(this));
                }
            }.bind(this));

    }
    play() {
        if (this._ima3) {
            if (this._ima3.playing) {
                this._ima3.manager.resume();
            } else if (this._ima3.inited) {
                this._dom.video.play();
            } else {
                try {
                    this._ima3.container.initialize();
                    this._ima3.manager.init(this.offsetWidth, this.offsetHeight, google.ima.ViewMode.NORMAL);
                    this._ima3.manager.start();
                    this._ima3.inited = true;
                } catch (adError) {
                    this._dom.video.play();
                }
            }
        } else {
            this._dom.video.play();
        }
    }

    pause() {
        this._dom.video.pause();
        if (this._ima3 && this._ima3.manager) {
            this._ima3.manager.pause();
        }
    }

    toggle() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    fullscreen() {
        if (this._fullscreened || !canFullScreen) {
            return;
        }

        this._previousFullscreened = {
            width: this.style.width,
            height: this.style.height
        };
        this.style.width = '100%';
        this.style.height = '100%';

        this._fullscreened = makeFullScreen(this);

        this.focus();
        this._resizeIma3();
    }

    exitFullscreen() {
        if (!this._fullscreened) {
            return;
        }

        this._fullscreened = makeFullScreen(this);

        this.style.width = this._previousFullscreened.width;
        this.style.height = this._previousFullscreened.height;
        delete(this._previousFullscreened);
        this._resizeIma3();
    }

    _keyDown(e) {
        e = e || window.event;

        switch (e.keyCode) {
            case 37:
                e.preventDefault();
                var currentTime = this.currentTime;
                currentTime -= 5;
                this.currentTime = Math.max(0, currentTime);
                this._forcedCurentTime = this.currentTime;
                this._updateControls('time', function() {
                    this._forcedCurentTime = false;
                }.bind(this));
                this._showUiTimer();
                return;
            case 39:
                e.preventDefault();
                var currentTime = this.currentTime;
                currentTime += 5;
                this.currentTime = Math.min(this.duration, currentTime);
                this._forcedCurentTime = this.currentTime;
                this._updateControls('time', function() {
                    this._forcedCurentTime = false;
                }.bind(this));
                this._showUiTimer();
                return;
            case 38:
                e.preventDefault();
                var volume = this.volume;
                volume += 0.05;
                this.volume = Math.min(1, volume);
                this._showUiTimer();
                return;
            case 40:
                e.preventDefault();
                var volume = this.volume;
                volume -= 0.05;
                this.volume = Math.max(0, volume);
                this._showUiTimer();
                return;
        }


        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.toggle();
                break;
            case 'f':
                e.preventDefault();
                if (this._fullscreened) {
                    this.exitFullscreen();
                } else {
                    this.fullscreen();
                }
                break;
            case 'm':
                e.preventDefault();
                this.muted = !this.muted;
                this._showUiTimer();
                break;
        }
    }

    _resizeIma3() {
        if (this._ima3 && this._ima3.manager) {
            requestAnimationFrame(function() {
                this._ima3.manager.resize(this.offsetWidth, this.offsetHeight, this._fullscreened ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
                if (isTouch && this._fullscreened) {
                    // In some case, when nav bar disappear, we have to wait a little bit more
                    setTimeout(function() {
                        this._ima3.manager.resize(this.offsetWidth, this.offsetHeight, google.ima.ViewMode.FULLSCREEN);
                    }.bind(this), 100);
                }
            }.bind(this));
        }
    }

    get src() {
        return this._src;
    }
    get ads() {
        return this._ads;
    }

    set currentTime(currentTime) {
        this._dom.video.currentTime = currentTime;
    }
    get currentTime() {
        return this._dom.video.currentTime;
    }

    get duration() {
        return this._dom.video.duration;
    }

    get buffered() {
        return this._dom.video.buffered;
    }

    set muted(muted) {
        this._dom.video.muted = muted;
        if (muted) {
            this._dom.video.setAttribute('muted', '');
        } else {
            this._dom.video.removeAttribute('muted');
        }

        if (this._ima3 && this._ima3.manager) {
            this._ima3.manager.setVolume(muted ? 0 : this._dom.video.volume);
        }
    }
    get muted() {
        return this._dom.video.muted;
    }

    get paused() {
        return this._dom.video.paused && (!this._ima3 || !this._ima3.playing);
    }

    get playingAd() {
        return this._ima3 && this._ima3.playing;
    }

    get ended() {
        return this._dom.video.ended;
    }

    set volume(volume) {
        volume = parseFloat(volume);
        if (volume === 0) {
            this.muted = true;
        } else {
            this._dom.video.volume = volume;

            if (this._ima3 && this._ima3.manager) {
                this._ima3.manager.setVolume(volume);
            }
            this.muted = false;
        }
    }

    get volume() {
        return this._dom.video.volume;
    }
}

window.customElements.define('nyro-video', NyroVideo);
