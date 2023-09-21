/////////////////////////////////////////////////////
// START nyro-select-option
/////////////////////////////////////////////////////

const templateOption = document.createElement('template');
templateOption.innerHTML = `
<style>
:host {
    font-family: "Arial";
    font-size: 1em;
    background-color: #fff;
    padding: 2px 3px;
}
:host(:hover) {
    background-color: #e9ecef;
}
:host([focused]) {
    background-color: #d7dfe8;
}
:host([selected]) {
    color: #fff;
    background-color: #15539e;
}
</style>
<slot></slot>
`;

class NyroSelectOption extends HTMLElement {

    connectedCallback() {
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.append(templateOption.content.cloneNode(true));
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(value) {
        if (value) {
            this.setAttribute('value', value);
        } else {
            this.removeAttribute('value');
        }
    }

    get selected() {
        return this.hasAttribute('selected');
    }

    set selected(selected) {
        if (selected) {
            this.setAttribute('selected', '');
        } else {
            this.removeAttribute('selected');
        }
    }

    get focused() {
        return this.hasAttribute('focused');
    }

    set focused(focused) {
        if (focused) {
            this.setAttribute('focused', '');
        } else {
            this.removeAttribute('focused');
        }
    }

    get label() {
        return this.innerHTML;
    }

}

window.customElements.define('nyro-select-option', NyroSelectOption);

/////////////////////////////////////////////////////
// END nyro-select-option
/////////////////////////////////////////////////////



/////////////////////////////////////////////////////
// START nyro-select
/////////////////////////////////////////////////////

const valueMissingMessage = (() => {
    let select = document.createElement('select');
    select.required = true;

    return select.validationMessage;
})();

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
    --nyro-select-search-font-size: 14px;
    --nyro-select-arrow-width: 2px;
    --nyro-select-arrow-color: currentColor;
    --nyro-select-color: currentColor;
    --nyro-select-placeholder-color: #a9a9a9;

    --nyro-select-dropdown-border: 1px solid #767676;
    --nyro-select-dropdown-border-radius: 2px;
    --nyro-select-dropdown-box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.3);
    --nyro-select-dropdown-max-width: 50vw;
    --nyro-select-dropdown-max-height: min(27em, 40vh);
    --nyro-select-dropdown-z-index: 9999;

    position: relative;
    display: inline-block;
    font-size: 0.8em;
    font-family: "Arial";
    color: #000;
    background: #fff;
    border: 1px solid #767676;
    border-radius: 2px;
    padding: 1px 2px;
}
:host(:focus) {
    outline: 2px solid #000;
}
:host:after {
    content: '';
    position: absolute;
    top: 50%;
    right: calc(var(--nyro-select-arrow-width) * 3);
    margin-top: calc(var(--nyro-select-arrow-width) * -1);
    display: inline-block;
    border: solid var(--nyro-select-arrow-color);
    border-width: 0 var(--nyro-select-arrow-width) var(--nyro-select-arrow-width) 0;
    padding: var(--nyro-select-arrow-width);
    transform: translate(0, -50%) rotate(45deg);
}
#search {
    width: 100%;
    font-family: inherit;
    font-weight: inherit;
    font-style: inherit;
    font-size: var(--nyro-select-search-font-size);
    color: var(--nyro-select-color);
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
}
#search::placeholder {
    color: var(--nyro-select-placeholder-color);
    opacity: 1;
}
#search::-webkit-search-decoration,
#search::-webkit-search-cancel-button,
#search::-webkit-search-results-button,
#search::-webkit-search-results-decoration {
    display: none;
}
.dropdown {
    position: fixed;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;

    border: var(--nyro-select-dropdown-border);
    border-radius: var(--nyro-select-dropdown-border-radius);
    box-shadow: var(--nyro-select-dropdown-box-shadow);

    max-width: var(--nyro-select-dropdown-max-width);
    max-height: var(--nyro-select-dropdown-max-height);

    z-index: var(--nyro-select-dropdown-z-index);

    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms, visibility 300ms;
}
:host([focused]):after {
    display: none;
}
:host([focused]) .dropdown {
    opacity: 1;
    visibility: visible;
}

@supports (-webkit-touch-callout: none) {
    #search {
        font-size: calc(max(var(--nyro-select-search-font-size), 16px));
    }
}
</style>
<input id="search" type="search" />
<div class="dropdown">
    <slot></slot>
</div>
`;

const normalizeTextReg = /\p{Diacritic}/gu;
const normalizeText = (text) => {
    return text.normalize('NFD').replace(normalizeTextReg, '').toLowerCase().trim();
};

class NyroSelect extends HTMLElement {

    static get formAssociated() {
        return true;
    }

    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    static get observedAttributes() {
        return ['required'];
    }

    get focused() {
        return this.hasAttribute('focused');
    }

    set focused(focused) {
        if (focused) {
            this.setAttribute('focused', '');
        } else {
            this.removeAttribute('focused');
        }
    }

    attributeChangedCallback(name, prev, next) {
        if (name === 'required') {
            this._setValidity();
        }
    }

    connectedCallback() {
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.append(template.content.cloneNode(true));

        const insideSlot = this.querySelector('style[slot="insideSlot"]');
        if (insideSlot) {
            this.shadowRoot.querySelector('style').textContent += insideSlot.textContent;
            insideSlot.remove();
        }

        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }

        this._value = undefined;
        this._search = this.shadowRoot.querySelector('input[type="search"]');
        this._dropdown = this.shadowRoot.querySelector('.dropdown');

        this.addEventListener('focus', (e) => {
            if (e.relatedTarget && e.relatedTarget.matches('[type="submit"]')) {
                return;
            }
            this._search.focus();
        });

        this.addEventListener('blur', () => {
            this.focused = false;
            const currentSelected = this.querySelector('nyro-select-option[selected]');
            if (currentSelected) {
                this._search.value = currentSelected.label;
            }
        });

        this.addEventListener('click', (e) => {
            if (this.focused || e.defaultPrevented) {
                return;
            }
            // Reset validity to hide native error message
            this._internals.setValidity({});
            this.focused = true;
            setTimeout(() => {
                // Re-evaluate validity value later
                this._setValidity();
            }, 150);
        });

        this._search.addEventListener('input', () => {
            this._filter();
        });

        this._search.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this._moveFocus(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this._moveFocus(1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this._selectFocused();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this._search.blur();
                    break;
            }
        });

        this._search.addEventListener('focus', (e) => {
            if (e.relatedTarget && e.relatedTarget.matches('[type="submit"]')) {
                return;
            }
            this._search.value = '';
            this.focused = true;
            this._filter();
            this._positionDropdown();
            const currentSelected = this.querySelector('nyro-select-option[selected]');
            if (currentSelected) {
                this._scrollIntoView(currentSelected);
            }
        });

        this._dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('nyro-select-option');
            if (!option) {
                return;
            }

            e.preventDefault();
            this._setOptionSelect(option);
            this.blur();
        });

        this._defaultOption = this.querySelector('nyro-select-option[value=""], nyro-select-option:not([value])');
        if (this._defaultOption) {
            //this._defaultOption.hidden = true;
        }
        this._search.placeholder = this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : (this._defaultOption ? this._defaultOption.label : '');

        let currentSelected = this.querySelector('nyro-select-option[selected]');
        if (!currentSelected && this._defaultOption) {
            currentSelected = this._defaultOption;
        }

        this._setOptionSelect(currentSelected, true);
    }

    get required() {
        return this.hasAttribute('required');
    }

    set required(required) {
        if (required) {
            this.setAttribute('required', '');
        } else {
            this.removeAttribute('required');
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        const currentSelected = this.querySelector('nyro-select-option[value="' + value + '"]');
        this._setOptionSelect(currentSelected);
    }

    _setOptionSelect(option, ignoreUnselect) {
        if (!ignoreUnselect) {
            this.querySelectorAll('nyro-select-option').forEach(opt => {
                opt.selected = false;
            });
        }

        if (option) {
            option.focused = false;
        }

        this._search.blur();

        if (option && option !== this._defaultOption) {
            this._value = option.value;
            this.setAttribute('value', this._value);
            option.selected = true;
            this._search.value = option.label;
            this._internals.setFormValue(option.value);
        } else {
            this._value = undefined;
            this.removeAttribute('value');
            this._internals.setFormValue('');
        }
        this._setValidity();
    }

    _positionDropdown() {
        const bounding = this.getBoundingClientRect();

        this._dropdown.style.minWidth = (bounding.width) + 'px';
        this._dropdown.style.top = (bounding.top + bounding.height) + 'px';
        this._dropdown.style.left = (bounding.left) + 'px';
    }

    _filter() {
        let searchVal = normalizeText(this._search.value);
        this.querySelectorAll('nyro-select-option').forEach(option => {
            const matching = searchVal.length ? normalizeText(option.label).indexOf(searchVal) !== -1 : true;
            option.hidden = !matching;
            if (!matching && option.focused) {
                option.focused = false;
            }
        });
    }

    _moveFocus(direction) {
        let currentlyFocused = this.querySelector('nyro-select-option[focused]:not([hidden])');
        if (!currentlyFocused) {
            currentlyFocused = this.querySelector('nyro-select-option[selected]:not([hidden])');
        }
        if (!currentlyFocused) {
            currentlyFocused = this.querySelector('nyro-select-option:not([hidden])');
            if (direction === 1) {
                // focus it directly, this is the first arrow down
                currentlyFocused.focused = true;
                this._scrollIntoView(currentlyFocused);
                return;
            }
        }
        if (!currentlyFocused) {
            // do nothing
            return;
        }
        let newFocused;
        if (direction > 0) {
            let currentCursor = currentlyFocused;
            // Search through all next sibling
            while (!newFocused && currentCursor.nextElementSibling) {
                currentCursor = currentCursor.nextElementSibling;
                if (currentCursor.matches('nyro-select-option:not([hidden])')) {
                    newFocused = currentCursor;
                }
            }

            if (!newFocused) {
                newFocused = this.querySelector('nyro-select-option:not([hidden])');
            }
        } else {
            let currentCursor = currentlyFocused;
            // Search through all previous sibling
            while (!newFocused && currentCursor.previousElementSibling) {
                currentCursor = currentCursor.previousElementSibling;
                if (currentCursor.matches('nyro-select-option:not([hidden])')) {
                    newFocused = currentCursor;
                }
            }

            if (!newFocused) {
                newFocused = this.querySelector('nyro-select-option:not([hidden]):last-child');
            }
        }

        if (newFocused && newFocused != currentlyFocused) {
            currentlyFocused.focused = false;
            newFocused.focused = true;
            this._scrollIntoView(newFocused);
        }
    }

    _selectFocused() {
        const currentlyFocused = this.querySelector('nyro-select-option[focused]:not([hidden])');
        if (!currentlyFocused) {
            this._setOptionSelect();
            this.focused = false;
            return;
        }

        this._setOptionSelect(currentlyFocused);
    }

    _scrollIntoView(option, direct) {
        option.scrollIntoView({
            block: 'center',
            inline: 'center',
            behavior: 'instant'
        });
    }

    _setValidity() {
        if (this.required && (this._value === undefined || this._value === '')) {
            this._internals.setValidity({
                valueMissing: true
            }, valueMissingMessage, this._search);
        } else {
            this._internals.setValidity({});
        }
    }

    checkValidity() {
        return this._internals.checkValidity();
    }

    reportValidity() {
        return this._internals.reportValidity();
    }

    setValidity(flags, message, anchor) {
        return this._internals.setValidity(flags, message, anchor || this._search);
    }

    get form() {
        return this.internals.form;
    }

    get name() {
        return this.getAttribute('name');
    }

    get type() {
        return this.localName;
    }

    get validity() {
        return this.internals_.validity;
    }

    get validationMessage() {
        return this.internals_.validationMessage;
    }

    get willValidate() {
        return this.internals_.willValidate;
    }

    // @todo read and implement more functions described here
    // https://web.dev/more-capable-form-controls/

}

window.customElements.define('nyro-select', NyroSelect);

export default NyroSelect;

/////////////////////////////////////////////////////
// END nyro-select-option
/////////////////////////////////////////////////////