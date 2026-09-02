// Explicit month/weekday name tables for fa and hy instead of relying on
// Intl.DateTimeFormat("fa-IR"/"hy-AM", ...) — some browsers/runtimes ship
// with reduced ICU data that has no strings for these locales at all and
// silently falls back to English instead of erroring, which would make the
// calendar look untranslated. English still goes through Intl, which is
// reliably available everywhere.

const MONTHS = {
  fa: ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"],
  hy: ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"],
};

// Sunday-first, matching the calendar grid's column order.
const WEEKDAYS_NARROW = {
  fa: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
  hy: ["Կ", "Ե", "Ե", "Չ", "Հ", "Ո", "Շ"],
};

const WEEKDAYS_SHORT = {
  fa: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
  hy: ["Կիրակի", "Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ"],
};

// AM/PM reads awkwardly translated word-for-word into Persian, and Armenian
// conventionally uses 24-hour time — so branch the whole time format instead
// of just swapping a suffix.
export function formatTimeLabel(timeStr, lang) {
  const [h, m] = timeStr.split(":").map(Number);
  if (lang === "hy") {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const period = lang === "fa" ? (h >= 12 ? "ب.ظ" : "ق.ظ") : h >= 12 ? "PM" : "AM";
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDateLabelLong(dateStr, lang) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (lang === "fa" || lang === "hy") {
    return `${WEEKDAYS_SHORT[lang][date.getDay()]}, ${MONTHS[lang][date.getMonth()]} ${date.getDate()}`;
  }
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function formatMonthYear(date, lang) {
  if (lang === "fa" || lang === "hy") {
    return `${MONTHS[lang][date.getMonth()]} ${date.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function weekdayNarrowLabels(lang) {
  if (lang === "fa" || lang === "hy") return WEEKDAYS_NARROW[lang];
  return ["S", "M", "T", "W", "T", "F", "S"];
}

export function formatFullDate(date, lang) {
  if (lang === "fa" || lang === "hy") {
    const weekday = WEEKDAYS_SHORT[lang][date.getDay()];
    const month = MONTHS[lang][date.getMonth()];
    return `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    date
  );
}
