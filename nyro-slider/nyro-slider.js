const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    --nyro-slider-animation-time: 300ms;
    --nyro-slider-slide-width: 100%;

    display: inline-block;
}
:host(:not([disable-swipe])) {
    touch-action: none;
}
main {
    --pos: 0;
    --nb: 1;

    --delta: calc(100% - var(--nyro-slider-slide-width));
    --maxTranslate: calc((var(--nb) - 1) * -1 * var(--nyro-slider-slide-width) + var(--delta));

    width: 100%;
    height: 100%;
    --width: 100%;
    overflow: hidden;
}
main div {
    display: flex;
    transform: translateX(
        max(
            var(--pos) * -1 * var(--nyro-slider-slide-width),
            var(--maxTranslate)
        )
    );
    transition: transform var(--nyro-slider-animation-time);
}
::slotted(*) {
    flex-shrink: 0;
}
.calc {
    display: block;
    width: var(--nyro-slider-slide-width);
    height: 0;
}
</style>
<main>
    <div>
        <slot></slot>
    </div>
</main>
<slot name="nav"></slot>
<span class="calc"></span>
`;

const pointerPos = {
        nyroSlider: false,
        first: {},
        last: {},
    },
    downCallback = (e) => {
        e.preventDefault();

        pointerPos.nyroSlider = e.target.closest("nyro-slider:not([disable-swipe])");
        pointerPos.first.x = e.clientX;
        pointerPos.first.y = e.clientY;

        document.body.addEventListener("pointermove", pointerMove);
        document.body.addEventListener("pointerup", pointerUp);
        document.body.addEventListener("pointercancel", pointerCancel);
    },
    checkSwipe = () => {
        const diffX = pointerPos.first.x - pointerPos.last.x;

        if (Math.abs(diffX) > 30) {
            if (diffX < 0) {
                pointerPos.nyroSlider.prev();
            } else {
                pointerPos.nyroSlider.next();
            }
            return true;
        }
    },
    pointerMove = (e) => {
        if (!pointerPos.nyroSlider) {
            return;
        }
        pointerPos.last.x = e.clientX;
        pointerPos.last.y = e.clientY;

        e.preventDefault();

        if (checkSwipe()) {
            unbind();
        }
    },
    pointerUp = (e) => {
        if (!pointerPos.nyroSlider) {
            return;
        }
        pointerPos.last.x = e.clientX;
        pointerPos.last.y = e.clientY;

        checkSwipe();
        unbind();
    },
    pointerCancel = () => {
        unbind();
    },
    unbind = () => {
        document.body.removeEventListener("pointermove", pointerMove);
        document.body.removeEventListener("pointerup", pointerUp);
        document.body.removeEventListener("pointercancel", pointerCancel);
        pointerPos.nyroSlider = false;
    };

class NyroSlider extends HTMLElement {
    static get observedAttributes() {
        return ["pos", "disable-swipe"];
    }

    attributeChangedCallback(name, prev, next) {
        if (name === "pos") {
            this._writePos();
        } else if (name === "disable-swipe") {
            this._handleSwipe();
        }
    }

    get pos() {
        return this.hasAttribute("pos") ? parseInt(this.getAttribute("pos")) : 0;
    }

    set pos(pos) {
        if (pos) {
            this.setAttribute("pos", parseInt(pos));
        } else {
            this.removeAttribute("pos");
        }
    }

    get disableSwipe() {
        return this.hasAttribute("disable-swipe");
    }

    set disableSwipe(disableSwipe) {
        if (disableSwipe) {
            this.setAttribute("disable-swipe", "");
        } else {
            this.removeAttribute("disable-swipe");
        }
    }

    constructor() {
        super();
        this.attachShadow({
            mode: "open",
        });
        this.shadowRoot.append(template.content.cloneNode(true));

        this._main = this.shadowRoot.querySelector("main");
        this._calcSpan = this.shadowRoot.querySelector(".calc");

        this._nbElements = 1;
        this.shadowRoot.addEventListener("slotchange", (e) => {
            this._countElements();
        });

        this._countElements();
        this.calcLayout();

        this.bindNav();
    }

    connectedCallback() {
        this._handleSwipe();
        this._inited = true;
    }

    _handleSwipe() {
        if (this.disableSwipe) {
            this.removeEventListener("pointerdown", downCallback);
        } else {
            this.addEventListener("pointerdown", downCallback)
        }
    }

    bindNav() {
        const prev = this.querySelector('.navPrev[slot="nav"]');
        if (prev) {
            prev.addEventListener("click", (e) => {
                e.preventDefault();
                this.prev();
            });
        }
        const next = this.querySelector('.navNext[slot="nav"]');
        if (next) {
            next.addEventListener("click", (e) => {
                e.preventDefault();
                this.next();
            });
        }
    }

    _writePos() {
        if (this.pos < 0) {
            this.pos = 0;
            return;
        }
        if (this.pos >= this._nbElements) {
            this.pos = this._nbElements - 1;
            return;
        }

        this._main.style.setProperty("--pos", this.pos);

        if (this._inited) {
            this.dispatchEvent(
                new CustomEvent("changedPosition", {
                    bubbles: true,
                    cancelable: true,
                    detail: this.pos,
                }),
            );
        }
    }

    _countElements() {
        this._nbElements = this.querySelectorAll(":scope > *:not([slot])").length;
        this._main.style.setProperty("--nb", this._nbElements);

        this.calcLayout();
    }

    calcLayout() {
        this._sliderWidth = this.clientWidth;
        this._slideWidth = this._calcSpan.clientWidth;
        this._nbSlidesShown = Math.floor(this._sliderWidth / this._slideWidth);

        if (this._nbElements) {
            this._maxPos = Math.ceil(this._nbElements / this._nbSlidesShown) - 1;
            if (this.pos > this._maxPos) {
                this.pos = this._maxPos;
            }
        }
    }

    prev() {
        let prevPos = this.pos - this._nbSlidesShown;
        if (prevPos < 0) {
            prevPos = this._nbElements - this._nbSlidesShown;
        }
        this.pos = prevPos;
    }

    next() {
        let nextPos = this.pos + this._nbSlidesShown;
        if (nextPos >= this._nbElements) {
            nextPos = 0;
        }
        this.pos = nextPos;
    }
}

window.customElements.define("nyro-slider", NyroSlider);

export default NyroSlider;
