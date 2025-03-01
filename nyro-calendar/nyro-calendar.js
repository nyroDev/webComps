const template = document.createElement("template");
template.innerHTML = `
<style>
:host {
    --nyro-calendar-font-family: system-ui;
    --nyro-calendar-text-color: #101010;
    --nyro-calendar-otherDay-text-color: #7a7a7a;
    --nyro-calendar-outOfrange-text-color: var(--nyro-calendar-otherDay-text-color);
    --nyro-calendar-link-color: #0078d4;
    --nyro-calendar-link-color-hover: #004a82;
    --nyro-calendar-background-color: #ffffff;

    --nyro-calendar-border-radius: 0.2em;

    --nyro-calendar-cannot-opacity: 0.5;

    --nyro-calendar-number-font: 0.85em var(--nyro-calendar-font-family);

    --nyro-calendar-dayFilled-font: var(--nyro-calendar-number-font);
    --nyro-calendar-dayFilled-text-color: var(--nyro-calendar-background-color);
    --nyro-calendar-dayFilled-bakground: var(--nyro-calendar-link-color);

    --nyro-calendar-dayFilledHighlight-font: var(--nyro-calendar-dayFilled-font);
    --nyro-calendar-dayFilledHighlight-text-color: var(--nyro-calendar-dayFilled-text-color);
    --nyro-calendar-dayFilledHighlight-bakground: #d40000;

    --nyro-calendar-header-padding: 0.2em 0.3em;
    --nyro-calendar-header-border-bottom: none;

    --nyro-calendar-header-div-color: var(--nyro-calendar-link-color);
    --nyro-calendar-header-div-color-hover: var(--nyro-calendar-link-color-hover);
    --nyro-calendar-header-div-font: "";
    --nyro-calendar-header-div-text-transform: capitalize;

    --nyro-calendar-header-nav-color: var(--nyro-calendar-link-color);
    --nyro-calendar-header-nav-color-hover: var(--nyro-calendar-link-color-hover);
    --nyro-calendar-header-nav-font: "";

    --nyro-calendar-dayNames-font: 80% var(--nyro-calendar-font-family);
    --nyro-calendar-dayNames-text-transform: uppercase;
    --nyro-calendar-dayNames-text-color: var(--nyro-calendar-text-color);
    --nyro-calendar-dayNames-border: none;

    --nyro-calendar-cell-size: 2em;
    --nyro-calendar-cell-padding: 0.06em;
    --nyro-calendar-cell-gap: 0.5em;

    position: relative;
    display: inline-block;
    font-family: var(--nyro-calendar-font-family);
    color: var(--nyro-calendar-text-color);
    background: var(--nyro-calendar-background-color);
    border: 1px solid #bfbfbf;
    padding: 0.3em;
    border-radius: var(--nyro-calendar-border-radius);
}
a {
    color: var(--nyro-calendar-link-color);
    text-decoration: none;
}
a:hover {
    color: var(--nyro-calendar-link-color-hover);
}
:host([readonly]) header a {
    color: var(--nyro-calendar-text-color);
    pointer-events: none;
}
:host([readonly]) header nav {
    display: none;
}
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nyro-calendar-header-padding);
    border-bottom: var(--nyro-calendar-header-border-bottom);
}
header div {
    font: var(--nyro-calendar-header-div-font);
    text-transform: var(--nyro-calendar-header-div-text-transform);
}
header div a {
    color: var(--nyro-calendar-header-div-color);
}
header div a:hover {
    color: var(--nyro-calendar-header-div-color-hover);
}
header nav {
    font: var(--nyro-calendar-header-nav-font);
}
header nav a {
    color: var(--nyro-calendar-header-nav-color);
}
header nav a:hover {
    color: var(--nyro-calendar-header-nav-color-hover);
}
header.cannotPrevMonth .prevMonth,
header.cannotNextMonth .nextMonth,
.chooseMonth .cannot,
.chooseYear .cannot {
    opacity: var(--nyro-calendar-cannot-opacity);
    pointer-events: none;
}
main section {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--nyro-calendar-cell-gap);
}
main section > span {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    font: var(--nyro-calendar-number-font);
    height: var(--nyro-calendar-cell-size);
    padding: var(--nyro-calendar-cell-padding);
}
#dayNames {
    color: var(--nyro-calendar-dayNames-text-color);
    font: var(--nyro-calendar-dayNames-font);
    text-transform: var(--nyro-calendar-dayNames-text-transform);
    border-bottom: var(--nyro-calendar-dayNames-border);
}
#dayNames > span {
    aspect-ratio: auto;
}
.day {
    position: relative;
    z-index: 0;
    border-radius: 50%;
}
.day:hover {
    z-index: 1;
}
.day > span {
    z-index: 1;
    pointer-events: none;
}
.day slot {
    display: inline;
    z-index: 0;
}
.otherDay {
    color: var(--nyro-calendar-otherDay-text-color);
}
.day_out_of_range {
    color: var(--nyro-calendar-outOfrange-text-color);
}
.today {
    font-weight: bold;
}
.empty {
    opacity: 0;
    pointer-events: none;
}
:host([mode="pick"]) .day:hover,
.dayFilled {
    --nyro-calendar-filled-font: var(--nyro-calendar-dayFilled-font);
    --nyro-calendar-filled-text-color: var(--nyro-calendar-dayFilled-text-color);
    --nyro-calendar-filled-bakground: var(--nyro-calendar-dayFilled-bakground);

    font: var(--nyro-calendar-filled-font);
    color: var(--nyro-calendar-filled-text-color);
    background: var(--nyro-calendar-filled-bakground);
}
.dayFilledHighlight,
.dayFilledHighlight:hover {
    --nyro-calendar-filled-font: var(--nyro-calendar-dayFilledHighlight-font);
    --nyro-calendar-filled-text-color: var(--nyro-calendar-dayFilledHighlight-text-color);
    --nyro-calendar-filled-bakground: var(--nyro-calendar-dayFilledHighlight-bakground);
}
:host([mode="pick"]) .day {
    cursor: pointer;
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
    border-radius: var(--nyro-calendar-border-radius);
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
    color: var(--nyro-calendar-link-color-hover);
}
.chooseMonth .month,
.chooseYear .year {
    font: var(--nyro-calendar-header-div-font);
    text-transform: var(--nyro-calendar-header-div-text-transform);
}
.chooseYear .yearPage {
    font: var(--nyro-calendar-header-nav-font);
}
.day_0 {
    --day: 0;
    --dayCol: 6;
}
.day_1 {
    --day: 1;
    --dayCol: 0;
}
.day_2 {
    --day: 2;
    --dayCol: 1;
}
.day_3 {
    --day: 3;
    --dayCol: 2;
}
.day_4 {
    --day: 4;
    --dayCol: 3;
}
.day_5 {
    --day: 5;
    --dayCol: 4;
}
.day_6 {
    --day: 6;
    --dayCol: 5;
}
:host([first-day-of-week="0"]) .day_0 {
    --dayCol: 0;
}
:host([first-day-of-week="0"]) .day_1 {
    --dayCol: 1;
}
:host([first-day-of-week="0"]) .day_2 {
    --dayCol: 2;
}
:host([first-day-of-week="0"]) .day_3 {
    --dayCol: 3;
}
:host([first-day-of-week="0"]) .day_4 {
    --dayCol: 4;
}
:host([first-day-of-week="0"]) .day_5 {
    --dayCol: 5;
}
:host([first-day-of-week="0"]) .day_6 {
    --dayCol: 6;
}
</style>
<header>
    <div>
        <a href="#" class="curMonth"></a>
        <a href="#" class="curYear"></a>
    </div>
    <nav>
        <a href="#" class="prevMonth" tabindex="-1">&lt;</a>
        <a href="#" class="nextMonth" tabindex="-1">&gt;</a>
    </nav>
</header>
<main>
    <section id="dayNames"></section>
    <section id="days"></section>
</main>
`;

const formatDate = (date) => {
    return date.getFullYear() + "-" + (date.getMonth() + 1 + "").padStart(2, "0") + "-" + (date.getDate() + "").padStart(2, "0");
};

const formatMonth = (date) => {
    return date.getFullYear() + "-" + (date.getMonth() + 1 + "").padStart(2, "0");
};

const calcRespectingMinMaxDate = (date, minDate, maxDate) => {
    let useDate = date;
    if (minDate && minDate > useDate) {
        useDate = minDate;
    }
    if (maxDate && maxDate < useDate) {
        useDate = maxDate;
    }

    return useDate;
};

const standardizeDate = (date) => {
    date.setHours(12);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
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

const today = new Date();
standardizeDate(today);

const todayFormatted = formatDate(today);

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

        html.push('<a href="#" class="changeYear yearPage prevPage">&lt;</a>');
        html.push('<a href="#" class="changeYear now">' + intlToday + "</a>");
        html.push('<a href="#" class="changeYear yearPage nextPage">&gt;</a>');

        html.push("</nav>");
        tplChooseYear.innerHTML = html.join("");
    }

    return tplChooseYear.content.cloneNode(true).firstElementChild;
};

class NyroCalendar extends HTMLElement {
    static get observedAttributes() {
        return ["month", "other-days", "first-day-of-week", "fixed-weeks", "min-date", "max-date"];
    }

    attributeChangedCallback(name, prev, next) {
        if (!this._inited) {
            return;
        }
        if (name === "month") {
            this._readMonthAttribute();
            this._write();
            this.dispatchEvent(
                new CustomEvent("changedMonth", {
                    bubbles: true,
                    cancelable: true,
                    detail: this.month,
                })
            );
        } else if (name === "first-day-of-week") {
            this._writeDays();
            this._write();
        } else if (name === "other-days") {
            this._write();
        } else if (name === "fixed-weeks") {
            this._write();
        } else if (name === "min-date") {
            this._readMinDateAttribute();
            if ((prev && prev.substring(0, 7) === this.month) || (this._minDate && formatMonth(this._minDate) == this.month)) {
                this._write();
            }
        } else if (name === "max-date") {
            this._readMaxDateAttribute();
            if ((prev && prev.substring(0, 7) === this.month) || (this._maxDate && formatMonth(this._maxDate) == this.month)) {
                this._write();
            }
        }
    }

    get mode() {
        return this.getAttribute("mode");
    }

    set mode(mode) {
        if (mode !== undefined) {
            this.setAttribute("mode", mode);
        } else {
            this.removeAttribute("mode");
        }
    }

    get month() {
        return formatMonth(this._month);
    }

    set month(month) {
        this.setAttribute("month", month);
    }

    get monthDate() {
        return new Date(this._month.getTime());
    }

    set monthDate(monthDate) {
        if (monthDate instanceof Date) {
            this.setAttribute("month", formatMonth(calcRespectingMinMaxDate(monthDate, this._minDate, this._maxDate)));
        }
    }

    // 0 for Sunday, 1 for Monday
    get firstDayOfWeek() {
        return this.hasAttribute("first-day-of-week") ? parseInt(this.getAttribute("first-day-of-week")) : 1;
    }

    set firstDayOfWeek(firstDayOfWeek) {
        if (firstDayOfWeek !== undefined) {
            this.setAttribute("first-day-of-week", parseInt(firstDayOfWeek));
        } else {
            this.removeAttribute("first-day-of-week");
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

    get fixedWeeks() {
        return this.hasAttribute("fixed-weeks");
    }

    set fixedWeeks(fixedWeeks) {
        if (fixedWeeks) {
            this.setAttribute("fixed-weeks", "");
        } else {
            this.removeAttribute("fixed-weeks");
        }
    }

    get minDate() {
        return this._minDate ? new Date(this._minDate.getTime) : undefined;
    }

    set minDate(minDate) {
        if (minDate && minDate instanceof Date) {
            this.setAttribute("min-date", formatDate(minDate));
        } else {
            this.removeAttribute("min-date");
        }
    }

    get maxDate() {
        return this.maxDate ? new Date(this.maxDate.getTime) : undefined;
    }

    set maxDate(maxDate) {
        if (maxDate && maxDate instanceof Date) {
            this.setAttribute("max-date", formatDate(maxDate));
        } else {
            this.removeAttribute("max-date");
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

    get multiple() {
        return this.hasAttribute("multiple");
    }

    set multiple(multiple) {
        if (multiple) {
            this.setAttribute("multiple", "");
        } else {
            this.removeAttribute("multiple");
        }
    }

    get value() {
        if (this.mode !== "pick") {
            return;
        }
        const values = Array.from(this.querySelectorAll("time")).map((time) => {
            const date = new Date(time.dateTime);
            standardizeDate(date);
            return date;
        });

        if (!this.multiple) {
            if (values.length === 0) {
                return false;
            }

            return values[0];
        }

        return values;
    }

    set value(value) {
        if (this.mode !== "pick") {
            return;
        }

        if (!value) {
            // Simply remove all existing values
            this.querySelectorAll("time").forEach((time) => {
                time.remove();
            });
            return;
        }

        if (this.multiple) {
            if (!Array.isArray(value)) {
                console.warn("Please set an array of Date object.");
                return;
            }
        } else if (!(value instanceof Date)) {
            console.warn("Please set a Date object.");
            return;
        } else {
            value = [value];
        }

        const matchedTimes = new Set();
        value.forEach((val) => {
            if (val) {
                const formattedDate = formatDate(val);
                let time = this.querySelector("time" + (this.multiple ? '[slot="day_' + formattedDate + '"]' : ""));
                if (!time) {
                    time = document.createElement("time");
                    this.appendChild(time);
                }

                time.slot = "day_" + formattedDate;
                time.dateTime = formattedDate;
                matchedTimes.add(time);
            }
        });

        this.querySelectorAll("time").forEach((time) => {
            if (!matchedTimes.has(time)) {
                time.remove();
            }
        });
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

        this._dayNames = this.shadowRoot.querySelector("#dayNames");
        this._days = this.shadowRoot.querySelector("#days");

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

        this.shadowRoot.addEventListener("slotchange", (e) => {
            if (!e.target.parentElement.classList.contains("day")) {
                return;
            }

            if (e.target.assignedElements().length) {
                e.target.parentElement.classList.add("dayFilled");
                e.target.parentElement.classList.toggle(
                    "dayFilledHighlight",
                    e.target.assignedElements().some((node) => node.classList.contains("highlight"))
                );
            } else {
                e.target.parentElement.classList.remove("dayFilled");
                e.target.parentElement.classList.remove("dayFilledHighlight");
            }
        });

        this._days.addEventListener("click", (e) => {
            if (this.mode !== "pick") {
                return;
            }
            let day = e.target.closest(".day");
            if (!day) {
                // In case of click into a slotted element, we have to search on composedPath
                day = e.composedPath().find((pathElement) => {
                    return pathElement.classList && pathElement.classList.contains("day");
                });

                if (!day) {
                    return;
                }
            }

            if (day.classList.contains("empty")) {
                return;
            }

            const slot = day.querySelector("slot");
            let time = this.querySelector("time" + (this.multiple ? '[slot="' + slot.name + '"]' : ""));

            if (time && time.slot === slot.name) {
                // Same value
                if (this.multiple) {
                    // In multiple, remove the value clicked
                    time.remove();
                }
                return;
            }

            if (!time) {
                time = document.createElement("time");
                this.appendChild(time);
            }

            time.slot = slot.name;
            time.dateTime = slot.name.substring(4);
            this.dispatchEvent(
                new CustomEvent("change", {
                    bubbles: true,
                    cancelable: true,
                })
            );
        });

        this._readMinDateAttribute();
        this._readMaxDateAttribute();
        this._readMonthAttribute();

        this._writeDays();
        this._write();
        this._inited = true;
    }

    _readMonthAttribute() {
        const monthStr = this.getAttribute("month");
        this._month = calcRespectingMinMaxDate(monthStr ? new Date(monthStr + "-15") : new Date(), this._minDate, this._maxDate);

        this._month.setDate(15);
        standardizeDate(this._month);
    }

    _readMinDateAttribute() {
        if (!this.hasAttribute("min-date")) {
            this._minDate = undefined;
            return;
        }

        this._minDate = new Date(this.getAttribute("min-date"));
        standardizeDate(this._minDate);
    }

    _readMaxDateAttribute() {
        if (!this.hasAttribute("max-date")) {
            this._maxDate = undefined;
            return;
        }

        this._maxDate = new Date(this.getAttribute("max-date"));
        standardizeDate(this._maxDate);
    }

    _writeDays() {
        const html = [];
        for (let i = 0; i < 7; i++) {
            const curDay = (this.firstDayOfWeek + i) % 7;
            html.push('<span class="day_' + curDay + '">' + nameDays[curDay] + "</span>");
        }
        this._dayNames.innerHTML = html.join("");
    }

    _write() {
        const firstDay = firstDayOfMonth(this._month),
            nbDays = daysInMonth(this._month),
            html = [];

        const tmpDate = new Date(this._month.getTime());
        tmpDate.setDate(1);

        tmpDate.setDate(tmpDate.getDate() - 1);
        this._header.classList.toggle("cannotPrevMonth", !this.respectMinMaxDate(tmpDate));

        tmpDate.setDate(tmpDate.getDate() + 1);

        let nbDaysBefore = 0;
        if (this.firstDayOfWeek != firstDay.getDay()) {
            nbDaysBefore = firstDay.getDay() - this.firstDayOfWeek;
        } else if (this.fixedWeeks && tmpDate.getMonth() === 1) {
            // The only case we're adding a complete line before current month is a February month that starts on first day of week.
            nbDaysBefore = 7;
        }

        if (nbDaysBefore) {
            tmpDate.setDate(tmpDate.getDate() - nbDaysBefore - 1);
            for (let i = 0; i < nbDaysBefore; i++) {
                tmpDate.setDate(tmpDate.getDate() + 1);
                html.push(this._htmlDay(this.otherDays ? "otherDay" : "empty", tmpDate));
            }
            tmpDate.setDate(tmpDate.getDate() + 1);
        }

        for (let i = 1; i <= nbDays; i++) {
            tmpDate.setDate(i);
            html.push(this._htmlDay("regularDay", tmpDate));
        }

        this._header.classList.toggle("cannotNextMonth", !this.respectMinMaxDate(tmpDate));

        if ((tmpDate.getDay() + 1) % 7 != this.firstDayOfWeek) {
            const missingDaysOnLastWeek = 7 - (html.length % 7);
            for (let i = 0; i < missingDaysOnLastWeek; i++) {
                tmpDate.setDate(tmpDate.getDate() + 1);
                html.push(this._htmlDay(this.otherDays ? "otherDay" : "empty", tmpDate));
            }
        }

        if (this.fixedWeeks && html.length <= 7 * 5) {
            // We need 6 weeks to have a fixed height
            for (let i = 0; i < 7; i++) {
                tmpDate.setDate(tmpDate.getDate() + 1);
                html.push(this._htmlDay(this.otherDays ? "otherDay" : "empty", tmpDate));
            }
        }

        this._curMonth.innerHTML = monthFormatter.format(this._month);
        this._curYear.innerHTML = this._month.getFullYear();
        this._days.innerHTML = html.join("");
    }

    _htmlDay(type, date) {
        const formattedDate = formatDate(date);

        return (
            '<span class="day ' +
            type +
            " day_" +
            date.getDay() +
            (this.respectMinMaxDate(date) ? "" : " day_out_of_range") +
            (todayFormatted === formattedDate ? " today" : "") +
            '">' +
            "<span>" +
            date.getDate() +
            "</span>" +
            '<slot name="day_' +
            formattedDate +
            '"></slot>' +
            "</span>"
        );
    }

    respectMinMaxDate(date) {
        if (!(date instanceof Date)) {
            return false;
        }

        const dateStd = new Date(date.getTime());
        standardizeDate(dateStd);

        if (this._minDate && this._minDate > dateStd) {
            return false;
        }
        if (this._maxDate && this._maxDate < dateStd) {
            return false;
        }

        return true;
    }

    prevMonth() {
        this.monthDate = new Date(this._month.getFullYear(), this._month.getMonth() - 1, 1);
    }

    nextMonth() {
        this.monthDate = new Date(this._month.getFullYear(), this._month.getMonth() + 1, 1);
    }

    chooseMonth() {
        if (!this._chooseMonth) {
            this._chooseMonth = createChooseMonth();

            this._chooseMonth.addEventListener("click", (e) => {
                const month = e.target.closest(".month");
                if (month) {
                    e.preventDefault();
                    this.monthDate = new Date(this._month.getFullYear(), month.dataset.month, 1);
                    this._chooseMonth.classList.remove("show");
                }
            });

            this.shadowRoot.appendChild(this._chooseMonth);
        }

        this._chooseMonth.querySelectorAll(".month").forEach((month) => {
            let canSwitch = true;
            const monthDate = new Date(this._month.getFullYear(), month.dataset.month, 15);
            standardizeDate(monthDate);

            const monthStr = formatMonth(monthDate);

            if (monthStr != this.month) {
                if (monthStr < this.month) {
                    monthDate.setDate(daysInMonth(monthDate));
                } else {
                    monthDate.setDate(1);
                }
                canSwitch = this.respectMinMaxDate(monthDate);
            }

            month.classList.toggle("active", month.dataset.month == this._month.getMonth());
            month.classList.toggle("cannot", !canSwitch);
        });

        this._chooseMonth.classList.toggle("show");
    }

    chooseYear() {
        if (!this._chooseYear) {
            this._chooseYear = createChooseYear();

            this._chooseYear.addEventListener("click", (e) => {
                const year = e.target.closest(".year");
                if (year) {
                    e.preventDefault();
                    this.monthDate = new Date(year.dataset.year, this._month.getMonth(), 1);
                    this._chooseYear.classList.remove("show");
                    return;
                }

                const changeYear = e.target.closest(".changeYear");
                if (changeYear) {
                    e.preventDefault();

                    if (changeYear.classList.contains("now")) {
                        this._chooseYearShowYear(new Date().getFullYear());
                    } else {
                        this._chooseYearShowYear(
                            parseInt(this._chooseYear.querySelector(".year:nth-child(5)").dataset.year) +
                                9 * (changeYear.classList.contains("prevPage") ? -1 : 1)
                        );
                    }
                }
            });

            this.shadowRoot.appendChild(this._chooseYear);
        }

        this._chooseYearShowYear(this._month.getFullYear());

        this._chooseYear.classList.toggle("show");
    }

    _chooseYearShowYear(year) {
        if (!this._chooseYear) {
            return;
        }

        year = parseInt(year);

        let curYear = year - 4;
        const dateYear = this._month.getFullYear();

        this._chooseYear.querySelector(".prevPage").classList.toggle("cannot", !this.respectMinMaxDate(new Date(curYear - 1 + "-12-31")));

        this._chooseYear.querySelectorAll(".year").forEach((yearNav) => {
            yearNav.dataset.year = curYear;
            yearNav.innerHTML = curYear;

            let canSwitch = true;
            if (curYear < dateYear) {
                canSwitch = this.respectMinMaxDate(new Date(curYear + "-12-31"));
            } else if (curYear > dateYear) {
                canSwitch = this.respectMinMaxDate(new Date(curYear + "-01-01"));
            }

            yearNav.classList.toggle("active", curYear == dateYear);
            yearNav.classList.toggle("cannot", !canSwitch);
            curYear++;
        });

        this._chooseYear.querySelector(".nextPage").classList.toggle("cannot", !this.respectMinMaxDate(new Date(curYear + "-01-01")));
    }
}

window.customElements.define("nyro-calendar", NyroCalendar);

export default NyroCalendar;
