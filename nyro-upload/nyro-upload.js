const NYRO_UPLOAD_STATUSES = {
    UPLOADING: "uploading",
    DONE: "done",
    ERROR: "error",
};

/////////////////////////////////////////////////////
// START nyro-upload-file
/////////////////////////////////////////////////////

const humanFileSize = (size) => {
    const mod = 1024;
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0;
    while (size > mod) {
        size /= mod;
        ++i;
    }
    return Math.round(size) + " " + units[i];
};

const templateFile = document.createElement("template");
templateFile.innerHTML = `
<style>
:host {
    display: block;
    min-width: var(--nyro-upload-file-min-width);
    font-size: var(--nyro-upload-font-size);
    font-family: var(--nyro-upload-font-family);
    color: var(--nyro-upload-color);
    background-color: var(--nyro-upload-background-color);
    border: var(--nyro-upload-border);
    border-radius: var(--nyro-upload-border-radius);
    padding: var(--nyro-upload-padding);
    margin-bottom: var(--nyro-upload-file-margin);
    box-sizing: border-box;
}
.file,
.status {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.file > span {
    white-space: nowrap;
}
.name {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: var(--nyro-upload-file-min-width);
}
.error {
    display: none;
}
.done,
:host(.uploaded) .status {
    display: none;
}
:host(.error) {
    background: var(--nyro-upload-file-error-color);
}
:host(.error) .progressCont {
    display: none;
}
:host(.uploaded) .done,
:host(.error) .error {
    display: block;
}
a {
    color: var(--nyro-upload-file-retry-color);
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
:host(.error) a {
    color: var(--nyro-upload-file-error-color-text);
}
</style>
<div class="file">
    <strong class="name"></strong>
    <span>(<span class="size"></span>)</span>
</div>
<div class="status">
    <div class="progressCont">
        Loading:
        <span class="progress">0.00</span>%
    </div>
    <div class="error">
        <span class="errorTxt"></span>
        <a href="#" class="retry">Retry</a>
    </div>
    <a href="#" class="cancel">Cancel</a>
</div>
<div class="done">Uploaded</div>
`;

class NyroUploadFile extends HTMLElement {
    connectedCallback() {
        this.attachShadow({
            mode: "open",
        });
        this.shadowRoot.append(templateFile.content.cloneNode(true));

        this._nameCont = this.shadowRoot.querySelector(".name");
        this._sizeCont = this.shadowRoot.querySelector(".size");
        this._progressCont = this.shadowRoot.querySelector(".progress");
        this._errorCont = this.shadowRoot.querySelector(".errorTxt");

        this.shadowRoot.querySelector(".retry").addEventListener("click", (e) => {
            e.preventDefault();
            this.retry();
        });

        this.shadowRoot.querySelector(".cancel").addEventListener("click", (e) => {
            e.preventDefault();
            this.cancel();
        });

        this._listener = {
            progress: (e) => {
                if (e.lengthComputable) {
                    this._setProgress(e.loaded, e.total);
                }
            },
            loadend: () => {
                if (this._xhr.readyState === 4 && this._xhr.status === 200) {
                    this._promise.resolve(this._xhr.responseText);
                } else {
                    this._promise.reject(this._xhr.status + ": " + this._xhr.statusText);
                }
                this._unbindXhr();
            },
            error: () => {
                this._promise.reject(this._xhr.status + ": ".this._xhr.statusText);
            },
        };
    }

    set url(url) {
        this.setAttribute("url", url);
    }

    set name(name) {
        this.setAttribute("name", name);
    }

    set file(file) {
        this._file = file;

        this._nameCont.innerHTML = this._file.name;
        this._setProgress(0, this._file.size);
    }

    get status() {
        return this._status ? this._status.status : false;
    }

    get fullStatus() {
        return this._status;
    }

    _setProgress(loaded, total) {
        if (this._sizeCont && this._progressCont) {
            if (loaded === true) {
                this.classList.add("uploaded");
            } else {
                this._sizeCont.innerHTML = humanFileSize(total);
                this._progressCont.innerHTML = Math.round((100 * 100 * loaded) / total) / 100;
            }
        }
    }

    upload() {
        if (this.status === NYRO_UPLOAD_STATUSES.UPLOADING) {
            console.warn("Already uploading");
            return;
        }

        this._status = {
            status: NYRO_UPLOAD_STATUSES.UPLOADING,
        };

        this.classList.remove("error");

        this._startUpload()
            .then((response) => {
                if (response) {
                    this._setProgress(true);
                    this._triggerStatus({
                        status: NYRO_UPLOAD_STATUSES.DONE,
                        response: response,
                    });
                } else {
                    this._triggerStatus({
                        status: NYRO_UPLOAD_STATUSES.ERROR,
                        response: response,
                    });
                    this.classList.add("error");
                }
            })
            .catch((e) => {
                this._triggerStatus({
                    status: NYRO_UPLOAD_STATUSES.ERROR,
                });
                this._errorCont.innerHTML = e;
                this.classList.add("error");
            });
    }

    _triggerStatus(status) {
        this._status = status;
        this.dispatchEvent(
            new CustomEvent("uploadStatus", {
                bubbles: true,
                cancelable: true,
                detail: status,
            })
        );
    }

    _startUpload() {
        const data = new FormData();
        data.append(this.getAttribute("name") || "file", this._file);

        // This function should return a promise that resolve to the JSON of the HTTP request

        // @todo update when upload progress is available for fetch
        // https://stackoverflow.com/questions/35711724/upload-progress-indicators-for-fetch/69400632#69400632
        this._xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            this._promise = {
                resolve: resolve,
                reject: reject,
            };
            this._xhr.upload.addEventListener("progress", this._listener.progress);
            this._xhr.addEventListener("loadend", this._listener.loadend);
            this._xhr.addEventListener("error", this._listener.error);

            this._xhr.open("POST", this.getAttribute("url") || document.location.href, true);
            this._xhr.send(data);
        });
    }

    _unbindXhr() {
        this._xhr.upload.removeEventListener("progress", this._listener.progress);
        this._xhr.removeEventListener("loadend", this._listener.loadend);
        this._xhr.removeEventListener("error", this._listener.error);

        this._promise = false;
    }

    _cancelUpload() {
        if (this.status === NYRO_UPLOAD_STATUSES.UPLOADING) {
            if (this._xhr) {
                this._unbindXhr();
                this._xhr.abort();
            }
            this._status = false;
        }
    }

    cancel() {
        this._cancelUpload();
        this._triggerStatus({
            status: "cancel",
        });
        this.remove();
    }

    retry() {
        if (this.status === NYRO_UPLOAD_STATUSES.ERROR) {
            this._cancelUpload();
            this.upload();
        }
    }
}

window.customElements.define("nyro-upload-file", NyroUploadFile);

/////////////////////////////////////////////////////
// END nyro-upload-file
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// START nyro-upload
/////////////////////////////////////////////////////

const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    --nyro-upload-font-size: 14px;
    --nyro-upload-font-family: "Arial";
    --nyro-upload-color: #000;
    --nyro-upload-background-color: #fff;

    --nyro-upload-color-hover: var(--nyro-upload-background-color);
    --nyro-upload-background-color-hover: var(--nyro-upload-color);

    --nyro-upload-border-color: #767676;
    --nyro-upload-border-radius: 2px;
    --nyro-upload-border: 1px solid var(--nyro-upload-border-color);
    --nyro-upload-padding: var(--nyro-upload-border-radius);

    --nyro-upload-uploading-max-height: 40vh;
    --nyro-upload-file-margin: 5px;
    --nyro-upload-file-min-width: min(300px, 100vw - 20px);
    --nyro-upload-file-retry-color: blue;
    --nyro-upload-file-error-color: red;
    --nyro-upload-file-error-color-text: #fff;

    position: relative;
    display: inline-block;
    font-size: var(--nyro-upload-font-size);
    font-family: var(--nyro-upload-font-family);
}
:host(:focus) {
    outline: 2px solid #000;
}
input {
    display: none;
}
label {
    display: inline-block;
    color: var(--nyro-upload-color);
    background-color: var(--nyro-upload-background-color);
    border: var(--nyro-upload-border);
    border-radius: var(--nyro-upload-border-radius);
    padding: var(--nyro-upload-padding);
    cursor: pointer;
    transition: 300ms color, 300ms background-color;
}
label:hover {
    color: var(--nyro-upload-color-hover);
    background-color: var(--nyro-upload-background-color-hover);
}
#uploading {
    position: absolute;
    top: 100%;
    left: 0;
    max-width: var(--nyro-upload-file-min-width);
    max-height: var(--nyro-upload-uploading-max-height);
    margin-top: calc(2 * var(--nyro-upload-border-radius));
    overflow: auto;
}
</style>
<label>
    <span>Browse...</span>
    <input type="file" />
</label>
<div id="uploading">
    <slot name="upload"></slot>
</div>
`;

class NyroUpload extends HTMLElement {
    static get observedAttributes() {
        return ["text", "multiple", "accept"];
    }

    attributeChangedCallback(name, prev, next) {
        if (name === "text") {
            this._setText();
        } else if (name === "multiple") {
            this._setMultiple();
        } else if (name === "accept") {
            this._setAccept();
        }
    }

    _setText() {
        if (this._label) {
            this._label.innerHTML = this.getAttribute("text") || "Browse...";
        }
    }

    _setMultiple() {
        if (this._input) {
            this._input.multiple = this.hasAttribute("multiple");
        }
    }

    _setAccept() {
        if (this._input) {
            this._input.accept = this.getAttribute("accept");
        }
    }

    get maxSyncUpload() {
        return this.hasAttribute("max-sync-upload") ? parseInt(this.getAttribute("max-sync-upload")) : 2;
    }

    get files() {
        return this.querySelectorAll("nyro-upload-file");
    }

    connectedCallback() {
        this.attachShadow({
            mode: "open",
        });
        this.shadowRoot.append(template.content.cloneNode(true));

        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", "0");
        }

        this._pending = 0;

        this._label = this.shadowRoot.querySelector("label span");
        this._input = this.shadowRoot.querySelector('input[type="file"]');
        this._uploading = this.shadowRoot.querySelector("#uploading");

        this._setText();
        this._setMultiple();
        this._setAccept();

        this._input.addEventListener("change", () => {
            Array.from(this._input.files).forEach((file) => {
                this.addUpload(file);
            });
            this._input.value = "";
            this.startUpload();
        });

        this.addEventListener("uploadStatus", (e) => {
            this._pending--;
            this.startUpload();
        });
    }

    addUpload(file) {
        const uploadFile = new NyroUploadFile();
        if (this.hasAttribute("url")) {
            uploadFile.url = this.getAttribute("url");
        }
        if (this.hasAttribute("name")) {
            uploadFile.name = this.getAttribute("name");
        }

        uploadFile.slot = "upload";
        this.append(uploadFile);

        uploadFile.file = file;
    }

    startUpload() {
        let nbUploading = 0;
        const needUploads = [];

        this.files.forEach((uploadFile) => {
            if (nbUploading + needUploads.length >= this.maxSyncUpload) {
                return;
            }
            switch (uploadFile.status) {
                case NYRO_UPLOAD_STATUSES.ERROR:
                    return;
                case NYRO_UPLOAD_STATUSES.UPLOADING:
                    nbUploading++;
                    break;
                case false:
                    needUploads.push(uploadFile);
                    break;
            }
        });

        if (needUploads.length) {
            needUploads.forEach((uploadFile) => {
                this._pending++;
                uploadFile.upload();
            });
        }

        if (this._pending === 0) {
            this._endUpload();
        }
    }

    clearDone() {
        this.files.forEach((uploadFile) => {
            if (uploadFile.status === NYRO_UPLOAD_STATUSES.DONE) {
                uploadFile.remove();
            }
        });
    }

    _endUpload() {
        const stats = {
            total: 0,
        };
        this.files.forEach((uploadFile) => {
            stats.total++;
            const status = uploadFile.status;
            if (status) {
                if (!stats[status]) {
                    stats[status] = 0;
                }
                stats[status]++;
            }
        });
        this.dispatchEvent(
            new CustomEvent("uploadEnded", {
                bubbles: true,
                cancelable: true,
                detail: stats,
            })
        );
    }
}

window.customElements.define("nyro-upload", NyroUpload);

/////////////////////////////////////////////////////
// END nyro-upload
/////////////////////////////////////////////////////'

export default NyroUpload;

export { NyroUpload, NyroUploadFile, NYRO_UPLOAD_STATUSES };
