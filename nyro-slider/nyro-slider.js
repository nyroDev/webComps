const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    --nyro-slider-animation-time: 300ms;
    --nyro-slider-slide-width: 100%;

    display: inline-block;
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

class NyroSlider extends HTMLElement {
    static get observedAttributes() {
        return ["pos"];
    }

    attributeChangedCallback(name, prev, next) {
        if (name === "pos") {
            this._writePos();
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
        this._writePos();

        this.bindNav();
    }

    connectedCallback() {
        this._inited = true;
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
        if (!this._inited) {
            return;
        }
        if (this.pos < 0) {
            this.pos = 0;
            return;
        }
        if (this.pos >= this._nbElements) {
            this.pos = this._nbElements - 1;
            return;
        }

        this._main.style.setProperty("--pos", this.pos);
        this.dispatchEvent(
            new CustomEvent("changedPosition", {
                bubbles: true,
                cancelable: true,
                detail: this.pos,
            })
        );
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
