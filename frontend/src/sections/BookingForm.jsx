import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2, PartyPopper } from "lucide-react";
import { getAvailableTimes, checkIn } from "../lib/api";
import DateCalendar from "../components/DateCalendar";
import { formatDateLabel, formatTimeLabel, todayISO } from "../lib/format";

export default function BookingForm() {
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
        <h3 className="font-display text-3xl text-cream">You're booked, {confirmation.customer.name.split(" ")[0]}</h3>
        <p className="mt-3 text-cream-dim">
          {formatDateLabel(confirmation.queue_date)} at {formatTimeLabel(confirmation.appointment_time)}
        </p>
        <p className="mt-1 text-sm text-cream-dim">Queue position #{confirmation.position}</p>
        <button type="button" onClick={bookAnother} className="btn-outline mt-8">
          Book Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 rounded-2xl border border-charcoal-lighter bg-charcoal p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
      <div>
        <label className="eyebrow mb-3 flex items-center gap-2">
          <Calendar size={14} /> Choose a date
        </label>
        <DateCalendar value={date} onChange={setDate} minDate={todayISO()} />

        <label className="eyebrow mb-3 mt-8 flex items-center gap-2">
          <Clock size={14} /> Available times
        </label>

        {slotsLoading && (
          <div className="flex items-center gap-2 text-sm text-cream-dim">
            <Loader2 size={16} className="animate-spin" /> Loading times&hellip;
          </div>
        )}

        {slotsError && <p className="text-sm text-red-400">{slotsError}</p>}

        {!slotsLoading && !slotsError && slots.length === 0 && (
          <p className="text-sm text-cream-dim">The shop is closed on this date. Try another day.</p>
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
                  {formatTimeLabel(slot.time)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="name" className="eyebrow mb-2 block">
            Full name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Miller"
            className="w-full rounded-lg border border-charcoal-lighter bg-ink px-4 py-3 text-cream outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="phone" className="eyebrow mb-2 block">
            Phone number
          </label>
          <input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 214-0192"
            className="w-full rounded-lg border border-charcoal-lighter bg-ink px-4 py-3 text-cream outline-none transition-colors focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="note" className="eyebrow mb-2 block">
            Note (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Requesting Amir, skin fade + beard line-up"
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
              <Loader2 size={16} className="animate-spin" /> Booking&hellip;
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Confirm Appointment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
