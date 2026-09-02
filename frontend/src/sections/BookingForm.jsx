import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2, PartyPopper } from "lucide-react";
import { getAvailableTimes, checkIn } from "../lib/api";
import DateCalendar from "../components/DateCalendar";
import { todayISO } from "../lib/format";
import { formatDateLabelLong, formatTimeLabel } from "../lib/i18n/dateFormat";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function BookingForm() {
  const { t, lang } = useLanguage();
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);

  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);

    getAvailableTimes(date)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((err) => {
        if (!cancelled) setSlotsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedTime) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const entry = await checkIn({
        name,
        phone,
        appointmentDate: date,
        appointmentTime: selectedTime,
        note,
      });
      setConfirmation(entry);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function bookAnother() {
    setConfirmation(null);
    setName("");
    setPhone("");
    setNote("");
    setSelectedTime(null);
  }

  if (confirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-gold/30 bg-charcoal p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold"
        >
          <PartyPopper size={30} />
        </motion.div>
        <h3 className="font-display text-3xl text-cream">
          {t("bookingForm.youAreBooked", { name: confirmation.customer.name.split(" ")[0] })}
        </h3>
        <p className="mt-3 text-cream-dim">
          {formatDateLabelLong(confirmation.queue_date, lang)} · {formatTimeLabel(confirmation.appointment_time, lang)}
        </p>
        <p className="mt-1 text-sm text-cream-dim">{t("bookingForm.queuePosition", { n: confirmation.position })}</p>
        <button type="button" onClick={bookAnother} className="btn-outline mt-8">
          {t("bookingForm.bookAnother")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 rounded-2xl border border-charcoal-lighter bg-charcoal p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
      <div>
        <label className="eyebrow mb-3 flex items-center gap-2">
          <Calendar size={14} /> {t("bookingForm.chooseDate")}
        </label>
        <DateCalendar value={date} onChange={setDate} minDate={todayISO()} />

        <label className="eyebrow mb-3 mt-8 flex items-center gap-2">
          <Clock size={14} /> {t("bookingForm.availableTimes")}
        </label>

        {slotsLoading && (
          <div className="flex items-center gap-2 text-sm text-cream-dim">
            <Loader2 size={16} className="animate-spin" /> {t("bookingForm.loadingTimes")}
          </div>
        )}

        {slotsError && <p className="text-sm text-red-400">{slotsError}</p>}

        {!slotsLoading && !slotsError && slots.length === 0 && (
          <p className="text-sm text-cream-dim">{t("bookingForm.closedOnDate")}</p>
        )}

        {!slotsLoading && !slotsError && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const disabled = !slot.available;
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-gold bg-gold text-ink"
                      : disabled
                      ? "cursor-not-allowed border-charcoal-lighter text-cream-dim/40 line-through"
                      : "border-charcoal-lighter text-cream/90 hover:border-gold hover:text-gold"
                  }`}
                >
                  {formatTimeLabel(slot.time, lang)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="name" className="eyebrow mb-2 block">
            {t("bookingForm.fullName")}
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("bookingForm.fullNamePlaceholder")}
            className="w-full rounded-lg border border-charcoal-lighter bg-ink px-4 py-3 text-cream outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="phone" className="eyebrow mb-2 block">
            {t("bookingForm.phoneNumber")}
          </label>
          <input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("bookingForm.phonePlaceholder")}
            className="w-full rounded-lg border border-charcoal-lighter bg-ink px-4 py-3 text-cream outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="note" className="eyebrow mb-2 block">
            {t("bookingForm.noteLabel")}
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("bookingForm.notePlaceholder")}
            rows={3}
            className="w-full resize-none rounded-lg border border-charcoal-lighter bg-ink px-4 py-3 text-cream outline-none transition-colors focus:border-gold"
          />
        </div>

        <AnimatePresence>
          {submitError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400"
            >
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={!selectedTime || submitting}
          className="btn-gold mt-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {t("bookingForm.booking")}
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> {t("bookingForm.confirmAppointment")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
