export default class NyroSw extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service worker not enabled');
            return;
        }

        if (!this.hasAttribute('url')) {
            console.warn('Service worker URL not provided');
            return;
        }

        window.addEventListener('load', () => {
            this._install();
        });
    }

    // Show the update button to the user and wait for a click on it
    _reqUpdate() {
        return new Promise((resolve, reject) => {
            const refreshButton = document.createElement('a');
            refreshButton.href = '#';
            refreshButton.classList.add('refreshBut', 'appBut');
            refreshButton.innerText = this.getAttribute('update') || 'Update';

            refreshButton.addEventListener('click', (e) => {
                resolve();
            });

            this.appendChild(refreshButton);
        });
    }

    // Call this function when an update is ready to show the button and request update
    _updateReady(worker) {
        return this._reqUpdate()
            .then(() => {
                // post message to worker to make him call skiWaiting for us
                worker.postMessage({
                    action: 'skipWaiting'
                });
            })
            .catch(() => {
                console.log('Rejected new version');
            });
    }

    // Track state change on worker and request update when ready
    _trackInstalling(worker) {
        worker.addEventListener('statechange', () => {
            if (worker.state == 'installed') {
                this._updateReady(worker);
            }
        });
    }

    _showVersion() {
        if (!this.hasAttribute('version')) {
            return;
        }

        fetch(this.getAttribute('version'))
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                console.warn(response);
            });
    }

    _install() {
        let refreshing;
        // When skipwaiting is called, reload the page only once
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) {
                return;
            }
            refreshing = true;
            window.location.reload();
        });

        navigator.serviceWorker.register(this.getAttribute('url')).then((registration) => {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            this._showVersion();

            if (registration.waiting) {
                // There is another SW waiting, the user can switch
                this._updateReady(registration.waiting);
                return;
            }

            if (registration.installing) {
                // There is another SW installing, listen to it to know when it's ready/waiting
                this._trackInstalling(registration.installing);
                return;
            }

            // If an update if found later, track the installing too
            registration.addEventListener('updatefound', () => {
                this._trackInstalling(registration.installing);
            });
        }, (err) => {
            console.log('ServiceWorker registration failed: ', err);
        });
    }

}

window.customElements.define('nyro-sw', NyroSw);