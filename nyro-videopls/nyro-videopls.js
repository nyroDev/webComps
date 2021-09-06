const headDom = document.querySelector('head');

let templateFullyInserted = false;
const templateOnce = document.createElement('template');

templateOnce.innerHTML = `<style>
nyro-videoplsitem {
    display: none;
    height: 100%;
}
nyro-videoplsitem.active {
    display: block;
}
</style>`;

window.NyroVideopls = class extends HTMLElement {

    connectedCallback() {
        if (document.createElement('nyro-video').constructor === HTMLElement) {
            throw 'nyro-video webcomponent is required.';
        }

        if (!templateFullyInserted) {
            headDom.insertBefore(document.importNode(templateOnce.content, true), headDom.firstChild);
            templateFullyInserted = true;
        }

        this._autoplay = this.hasAttribute('autoplay');
        this._ads = this.getAttribute('ads');

        this._items = [];

        this.addEventListener('nyroVideoControlsInited', (e) => {
            const htmls = [
                document.createElement('div'),
                document.createElement('div')
            ];

            htmls[0].classList.add('nyroVideoPrev');
            htmls[0].innerHTML = '<button class="nyroVideoPrevBut">' + window._nyroVideoUtils.svgIcon('prev') + '</button>';
            htmls[0].addEventListener('click', (e) => {
                e.preventDefault();
                this.prev();
            });

            htmls[1].classList.add('nyroVideoNext');
            htmls[1].innerHTML = '<button class="nyroVideoNextBut">' + window._nyroVideoUtils.svgIcon('next') + '</button>';

            htmls[1].addEventListener('click', (e) => {
                e.preventDefault();
                this.next();
            });

            const after = e.detail.dom.controls.querySelector(e.detail.controls.indexOf('playPause') > -1 ? '.nyroVideoPlayPause' : '.nyroVideoProgress');
            for (let i = htmls.length - 1; i >= 0; i--) {
                after.insertAdjacentElement('afterend', htmls[i]);
            }
        });

        this.querySelectorAll('nyro-videoplsitem').forEach((elt) => {
            this.addItem(elt);
        });
    }

    addItem(item) {
        this._items.push(item);

        if (this._items.length === 1) {
            if (this._autoplay) {
                this._playItem(item);
            } else {
                // init first video to have a UI
                this._setActiveItem(item);
                item.video; // will trigger the init of the video
                this.dispatchEvent(new CustomEvent('nyroVideoPlsActiveItem', {
                    bubbles: true,
                    cancelable: true,
                    detail: item
                }));
            }
        }
    }

    _checkItems() {
        if (!this._items.length) {
            throw 'No items found in pls';
        }
    }

    _checkMultipleItems() {
        if (this._items.length <= 1) {
            console.warn('There is only 1 item in pls');
            return false;
        }

        return true;
    }

    _setActiveItem(item, reason) {
        if (this._activeItem && item != this._activeItem) {
            this._leaveItem(this._activeItem);
        }
        item.classList.add('active');
        this._activeItem = item;
    }

    _leaveItem(item) {
        item.classList.remove('active');
        item.pause();
        item.video.currentTime = 0;
    }

    _playItem(item) {
        const oldItem = this._activeItem;
        this._setActiveItem(item);
        item.play();
        if (oldItem) {
            item.video.volume = oldItem.video.volume;
            item.video.muted = oldItem.video.muted;
            if (oldItem.video.fullscreened) {
                item.video.fullscreen();
            }
        }
        this.dispatchEvent(new CustomEvent('nyroVideoPlsActiveItem', {
            bubbles: true,
            cancelable: true,
            detail: item
        }));
    }

    get nbItems() {
        return this._items.length;
    }

    get curItemIndex() {
        return this._activeItem ? this._items.indexOf(this._activeItem) : -1;
    }

    get activeItem() {
        return this._activeItem;
    }

    play(index) {
        this._checkItems();
        let newItem;
        if (index) {
            index = parseInt(index);
            if (index < 0 || index >= this._items.length) {
                throw 'Index ' + index + ' is out of range';
            }
            newItem = this._items[index];
        } else if (this._activeItem) {
            newItem = this._activeItem;
        } else {
            newItem = this._items[0];
        }
        this._playItem(newItem);
    }

    next() {
        this._checkItems();
        let newItem = this._items[0];
        if (this._activeItem && this._checkMultipleItems() && this._activeItem.nextElementSibling) {
            newItem = this._activeItem.nextElementSibling;
        }
        this._playItem(newItem);
    }

    prev() {
        this._checkItems();
        let newItem = this._items[this._items.length - 1];
        if (this._activeItem && this._checkMultipleItems() && this._activeItem.previousElementSibling) {
            newItem = this._activeItem.previousElementSibling;
        }
        this._playItem(newItem);
    }

    _volumeChanged(item) {
        if (item != this._activeItem) {
            return;
        }

        for (let i = 0; i < this._items.length; i++) {
            if (item != this._items[i] && this._items[i]._video) {
                this._items[i].video.volume = item.video.volume;
            }
        }
    }

    fullscreen() {
        if (this._fullscreened || !window._nyroVideoUtils.fullscreen.can) {
            return;
        }

        this._previousFullscreened = {
            width: this.style.width,
            height: this.style.height
        };
        this.style.width = '100%';
        this.style.height = '100%';

        this._fullscreened = window._nyroVideoUtils.fullscreen.make(this);

        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i]._video) {
                this._items[i].video._fullscreened = this._fullscreened;
                this._items[i].video.classList.toggle('fullscreened', this._fullscreened);
            }
        }

        this.focus();
    }

    exitFullscreen() {
        if (!this._fullscreened) {
            return;
        }

        this._fullscreened = window._nyroVideoUtils.fullscreen.make(this);

        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i]._video) {
                this._items[i].video._fullscreened = this._fullscreened;
                this._items[i].video.classList.toggle('fullscreened', this._fullscreened);
            }
        }

        this.style.width = this._previousFullscreened.width;
        this.style.height = this._previousFullscreened.height;
        delete(this._previousFullscreened);
    }

    controlsMasterCall(item, fct) {
        if (fct === 'fullscreen') {
            this.fullscreen();
            return false;
        } else if (fct === 'exitFullscreen') {
            this.exitFullscreen();
            return false;
        }
    }
};

window.NyroVideoplsitem = class extends HTMLElement {

    connectedCallback() {
        this._pls = this.parentElement;

        this._src = this.getAttribute('src');
        if (!this._src) {
            console.warn('no src attribute found');
        }

        if (this._pls.addItem) {
            this._pls.addItem(this);
        }
    }

    _initVideo(needPlay) {
        if (this._video) {
            return false;
        }

        this._video = new NyroVideo();

        for (let i = this.attributes.length - 1; i >= 0; i--) {
            this._video.setAttribute(this.attributes[i].name, this.attributes[i].value);
        }

        if (!this._video.ads && this._pls._ads) {
            this._video.setAttribute('ads', this._pls._ads);
        }

        if (this._pls.hasAttribute('controls')) {
            this._video.setAttribute('controls', this._pls.getAttribute('controls'));
        }

        if (this._pls.hasAttribute('discard-aspect-ratio')) {
            this._video.setAttribute('discard-aspect-ratio', '');
        }

        if (needPlay) {
            this._video.setAttribute('autoplay', '');
        }

        this._video.controlsMaster = this;

        this.appendChild(this._video);

        if (this._pls._fullscreened) {
            this._video._fullscreened = true;
            this._video.classList.add('fullscreened');
        }

        this._video.bubbleEvents = true;
        this._video.addEventListener('ended', () => {
            this._pls.next();
        }, window._nyroVideoUtils.evtPassivePrm);
        this._video.addEventListener('volumechange', () => {
            this._pls._volumeChanged(this);
        }, window._nyroVideoUtils.evtPassivePrm);

        return true;
    }

    get video() {
        this._initVideo();
        return this._video;
    }

    controlsMasterCall(video, fct) {
        return this._pls.controlsMasterCall(this, fct);
    }

    play() {
        if (!this._initVideo(true)) {
            this._video.play();
        }
    }

    pause() {
        this._initVideo();
        this._video.pause();
    }
};

window.customElements.define('nyro-videoplsitem', NyroVideoplsitem);
window.customElements.define('nyro-videopls', NyroVideopls);