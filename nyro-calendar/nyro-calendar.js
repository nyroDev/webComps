const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    --nyro-calendar-text-color: #000000;
    --nyro-calendar-background-color: #ffffff;

    position: relative;
    display: inline-block;
    font-size: 0.8em;
    font-family: "Arial";
    color: var(--nyro-calendar-text-color);
    background: var(--nyro-calendar-background-color);
    border: 1px solid #767676;
    border-radius: 2px;
    padding: 1px 2px;
}
:host a {
    color: var(--nyro-calendar-text-color);
}
:host([readonly]) header nav {
    display: none;
}
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
table {
    text-align: center;
}

.chooseMonth,
.chooseYear {
    position: absolute;
    inset: 0;
    display: none;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    background: var(--nyro-calendar-background-color);
}
.chooseMonth.show,
.chooseYear.show {
    display: flex;
}
.chooseMonth > a,
.chooseYear > a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 33%;
    height: 25%;
}
.chooseMonth > a.active,
.chooseYear > a.active {
    font-weight: bold;
}
</style>
<header>
    <div>
        <span class="curMonth"></span>
        <span class="curYear"></span>
    </div>
    <nav>
        <a href="#" class="prevMonth" tabindex="-1">&lt;</a>
        <a href="#" class="nextMonth" tabindex="-1">&gt;</a>
    </nav>
</header>
<table>
    <thead>
        <tr></tr>
    </thead>
    <tbody>
    </tbody>
</table>
`;

const formatDate = (date) => {
    return date.getFullYear() + "-" + (date.getMonth() + 1 + "").padStart(2, "0") + "-" + (date.getDate() + "").padStart(2, "0");
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const nameDays = [];

(function () {
    // Anonymous function to fill nameDays
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    const tmpDate = new Date();
    tmpDate.setHours(15, 0, 0, 0);
    tmpDate.setDate(tmpDate.getDate() - tmpDate.getDay() - 1); /* Move on saturday */

    [...Array(7)].map((_, i) => {
        nameDays.push(formatter.format(tmpDate.setDate(tmpDate.getDate() + 1)).substring(0, 3));
    });
})();

const intlToday = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(0, "day");

let tplChooseMonth;
const createChooseMonth = () => {
    if (!tplChooseMonth) {
        tplChooseMonth = document.createElement("template");

        const html = [];
        html.push('<nav class="chooseMonth">');

        const formatter = new Intl.DateTimeFormat(undefined, { month: "short" });
        const tmpDate = new Date();
        tmpDate.setHours(15, 0, 0, 0);
        tmpDate.setDate(15);

        for (let i = 0; i < 12; i++) {
            tmpDate.setMonth(i);
            html.push('<a href="#" class="month" data-month="' + i + '">' + formatter.format(tmpDate) + "</a>");
        }

        html.push("</nav>");
        tplChooseMonth.innerHTML = html.join("");
    }

    return tplChooseMonth.content.cloneNode(true).firstElementChild;
};

let tplChooseYear;
const createChooseYear = () => {
    if (!tplChooseYear) {
        tplChooseYear = document.createElement("template");

        const html = [];
        html.push('<nav class="chooseYear">');

        for (let i = 0; i < 9; i++) {
            html.push('<a href="#" class="year"></a>');
        }

        html.push('<a href="#" class="changeYear prevPage">&lt;</a>');
        html.push('<a href="#" class="changeYear now">' + intlToday + "</a>");
        html.push('<a href="#" class="changeYear nextPage">&gt;</a>');

        html.push("</nav>");
        tplChooseYear.innerHTML = html.join("");
    }

    return tplChooseYear.content.cloneNode(true).firstElementChild;
};

class NyroCalendar extends HTMLElement {
    static get observedAttributes() {
        return ["date", "other-days"];
    }

    attributeChangedCallback(name, prev, next) {
        if (!this._inited) {
            return;
        }
        if (name === "date") {
            this._readDateAttribute();
            this._write();
        } else if (name === "other-days") {
            this._write();
        }
    }

    get date() {
        return this._date;
    }

    set date(date) {
        if (date instanceof Date) {
            this.setAttribute("date", formatDate(date));
        }
    }

    get otherDays() {
        return this.hasAttribute("other-days");
    }

    set otherDays(otherDays) {
        if (otherDays) {
            this.setAttribute("other-days", "");
        } else {
            this.removeAttribute("other-days");
        }
    }

    get readonly() {
        return this.hasAttribute("readonly");
    }

    set readonly(readonly) {
        if (readonly) {
            this.setAttribute("readonly", "");
        } else {
            this.removeAttribute("readonly");
        }
    }

    connectedCallback() {
        this.attachShadow({
            mode: "open",
        });
        this.shadowRoot.append(template.content.cloneNode(true));

        this._header = this.shadowRoot.querySelector("header");
        this._curMonth = this._header.querySelector(".curMonth");
        this._curYear = this._header.querySelector(".curYear");

        this._prevMonth = this._header.querySelector(".prevMonth");
        this._nextMonth = this._header.querySelector(".nextMonth");

        this._trDays = this.shadowRoot.querySelector("thead tr");
        this._tbody = this.shadowRoot.querySelector("tbody");

        this._curMonth.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.readonly) {
                this.chooseMonth();
            }
        });

        this._curYear.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.readonly) {
                this.chooseYear();
            }
        });

        this._prevMonth.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.readonly) {
                this.prevMonth();
            }
        });
        this._nextMonth.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.readonly) {
                this.nextMonth();
            }
        });

        this._readDateAttribute();

        this._writeDays();
        this._write();
        this._inited = true;
    }

    _readDateAttribute() {
        const dateStr = this.getAttribute("date");
        this._date = dateStr ? new Date(dateStr) : new Date();
        this._date.setHours(12);
        this._date.setMinutes(0);
        this._date.setSeconds(0);
        this._date.setMilliseconds(0);
    }

    // 0 for Sunday, 1 for Monday
    get firstDayOfWeek() {
        return 1;
    }

    _writeDays() {
        const html = [];
        for (let i = 0; i < 7; i++) {
            html.push("<th>" + nameDays[(this.firstDayOfWeek + i) % 7] + "</th>");
        }
        this._trDays.innerHTML = html.join("");
    }

    _write() {
        const firstDay = firstDayOfMonth(this._date),
            nbDays = daysInMonth(this._date),
            html = [];

        let curLine = [];

        if (this.firstDayOfWeek != firstDay.getDay()) {
            if (this.otherDays) {
                const prevNbDays = daysInMonth(new Date(this._date.getFullYear(), this._date.getMonth() - 1, 1)),
                    diffDays = firstDay.getDay() - this.firstDayOfWeek;
                for (let i = this.firstDayOfWeek; i < firstDay.getDay(); i++) {
                    curLine.push('<td class="otherDay day_' + i + '">' + (prevNbDays - diffDays + i) + "</td>");
                }
            } else {
                for (let i = this.firstDayOfWeek; i < firstDay.getDay(); i++) {
                    curLine.push('<td class="empty day_' + i + '"></td>');
                }
            }
        }

        for (let i = 1; i <= nbDays; i++) {
            curLine.push('<td class="day_' + ((curLine.length + 1) % 7) + '">' + i + "</td>");
            if (curLine.length === 7) {
                html.push("<tr>" + curLine.join("") + "</tr>");
                curLine = [];
            }
        }

        if (curLine.length) {
            for (let i = 1; curLine.length < 7; i++) {
                if (this.otherDays) {
                    curLine.push('<td class="otherDay day_' + ((curLine.length + 1) % 7) + '">' + i + "</td>");
                } else {
                    curLine.push('<td class="empty day_' + ((curLine.length + 1) % 7) + '"></td>');
                }
            }
            html.push("<tr>" + curLine.join("") + "</tr>");
        }

        this._curMonth.innerHTML = monthFormatter.format(this._date);
        this._curYear.innerHTML = this._date.getFullYear();
        this._tbody.innerHTML = html.join("");
    }

    prevMonth() {
        this.date = new Date(this._date.getFullYear(), this._date.getMonth() - 1, 1);
    }

    nextMonth() {
        this.date = new Date(this._date.getFullYear(), this._date.getMonth() + 1, 1);
    }

    chooseMonth() {
        if (!this._chooseMonth) {
            this._chooseMonth = createChooseMonth();

            this._chooseMonth.addEventListener("click", (e) => {
                const month = e.target.closest(".month");
                if (month) {
                    e.preventDefault();
                    this.date = new Date(this._date.getFullYear(), month.dataset.month, 1);
                    this._chooseMonth.classList.remove("show");
                }
            });

            this.shadowRoot.appendChild(this._chooseMonth);
        }

        const curActive = this._chooseMonth.querySelector(".active");
        if (curActive) {
            curActive.classList.remove("active");
        }
        this._chooseMonth.querySelector('.month[data-month="' + this._date.getMonth() + '"]').classList.add("active");
        this._chooseMonth.classList.toggle("show");
    }

    chooseYear() {
        if (!this._chooseYear) {
            this._chooseYear = createChooseYear();

            this._chooseYear.addEventListener("click", (e) => {
                const year = e.target.closest(".year");
                if (year) {
                    e.preventDefault();
                    this.date = new Date(year.dataset.year, this._date.getMonth(), 1);
                    this._chooseYear.classList.remove("show");
                    return;
                }

                const changeYear = e.target.closest(".changeYear");
                if (changeYear) {
                    e.preventDefault();

                    if (changeYear.classList.contains("now")) {
                        this._chooseYearShowYear(new Date().getFullYear());
                    } else {
                        this._chooseYearShowYear(parseInt(this._chooseYear.querySelector(".year:nth-child(5)").dataset.year) + 9 * (changeYear.classList.contains("prevPage") ? -1 : 1));
                    }
                }
            });

            this.shadowRoot.appendChild(this._chooseYear);
        }

        this._chooseYearShowYear(this._date.getFullYear());

        this._chooseYear.classList.toggle("show");
    }

    _chooseYearShowYear(year) {
        if (!this._chooseYear) {
            return;
        }

        year = parseInt(year);

        let curYear = year - 4;
        const dateYear = this._date.getFullYear();
        this._chooseYear.querySelectorAll(".year").forEach((yearNav) => {
            yearNav.dataset.year = curYear;
            yearNav.innerHTML = curYear;
            yearNav.classList.toggle("active", curYear == dateYear);
            curYear++;
        });
    }
}

window.customElements.define("nyro-calendar", NyroCalendar);

export default NyroCalendar;
