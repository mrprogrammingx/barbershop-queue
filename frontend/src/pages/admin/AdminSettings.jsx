import { useEffect, useState } from "react";
import {
  addIncludedSlot,
  blockSlot,
  getAvailableTimesAdmin,
  getShopStatus,
  removeIncludedSlot,
  setNotificationEmails,
  setOpenDays,
  setScheduleSettings,
  setShopStatus,
  unblockSlot,
} from "../../lib/adminApi";
import { Card, Toggle, buttonClass, buttonOutlineClass, inputClass } from "../../components/admin/ui";
import DatePickerField from "../../components/admin/DatePickerField";
import { useAdminUI } from "../../components/admin/AdminUIContext";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const DAY_OPTIONS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

export default function AdminSettings() {
  const { toast } = useAdminUI();
  const [status, setStatus] = useState(null);
  const [openDays, setOpenDaysState] = useState([]);
  const [schedule, setSchedule] = useState({ open_time: "", close_time: "", slot_duration_minutes: 30, capacity_per_slot: 1 });
  const [emailsText, setEmailsText] = useState("");
  const [emailsMessage, setEmailsMessage] = useState("");
  const [blockDate, setBlockDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [newTime, setNewTime] = useState("");

  async function refreshStatus() {
    const data = await getShopStatus();
    setStatus(data);
    setOpenDaysState(data.open_days);
    setSchedule({
      open_time: data.open_time.slice(0, 5),
      close_time: data.close_time.slice(0, 5),
      slot_duration_minutes: data.slot_duration_minutes,
      capacity_per_slot: data.capacity_per_slot,
    });
    setEmailsText(data.notification_emails.join("\n"));
  }

  async function refreshSlots() {
    const data = await getAvailableTimesAdmin(blockDate);
    setSlots(data);
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    refreshSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockDate]);

  async function toggleBookingToday() {
    await setShopStatus({ booking_open: !status.booking_open });
    refreshStatus();
  }

  function toggleDay(value) {
    setOpenDaysState((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function saveOpenDays(e) {
    e.preventDefault();
    await setOpenDays(openDays);
    toast("Days open saved.");
  }

  async function saveSchedule(e) {
    e.preventDefault();
    await setScheduleSettings({
      open_time: schedule.open_time,
      close_time: schedule.close_time,
      slot_duration_minutes: Number(schedule.slot_duration_minutes),
      capacity_per_slot: Number(schedule.capacity_per_slot),
    });
    toast("Slot settings saved.");
  }

  async function saveEmails(e) {
    e.preventDefault();
    const notification_emails = emailsText
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    try {
      await setNotificationEmails(notification_emails);
      setEmailsMessage("Notification emails saved.");
    } catch (err) {
      setEmailsMessage(`Error: ${err.message}`);
    }
  }

  async function handleSlotClick(slot) {
    if (slot.included) {
      await removeIncludedSlot(blockDate, slot.time);
    } else if (slot.blocked) {
      await unblockSlot(blockDate, slot.time);
    } else {
      await blockSlot(blockDate, slot.time);
    }
    refreshSlots();
  }

  async function addExtraTime(e) {
    e.preventDefault();
    if (!newTime) return;
    await addIncludedSlot(blockDate, newTime);
    setNewTime("");
    refreshSlots();
  }

  if (!status) return <p className="text-cream/50">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">Settings</h1>

      <Card title="Booking Today">
        <p className="mb-4 max-w-md text-sm text-cream/60">
          Turn off new bookings for today only, without changing the regular weekly schedule. Other dates stay bookable.
        </p>
        <div className="flex items-center gap-4">
          <Toggle checked={status.booking_open} onChange={toggleBookingToday} label="Toggle booking open or closed for today" />
          <span className={`text-sm font-medium ${status.booking_open ? "text-gold" : "text-cream/50"}`}>
            {status.booking_open ? "Booking is open for today" : "Booking is closed for today"}
          </span>
        </div>
      </Card>

      <Card title="Days Open">
        <form onSubmit={saveOpenDays} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            {DAY_OPTIONS.map((day) => {
              const active = openDays.includes(day.value);
              return (
                <label
                  key={day.value}
                  className={`cursor-pointer select-none rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                    active
                      ? "border-gold bg-gold text-ink shadow-[0_0_16px_-4px_rgba(201,151,74,0.7)]"
                      : "border-charcoal-lighter bg-ink text-cream/60 hover:border-gold/50 hover:text-cream"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleDay(day.value)}
                    className="sr-only"
                  />
                  {day.label}
                </label>
              );
            })}
          </div>
          <button type="submit" className={`${buttonClass} self-start`}>
            Save Days Open
          </button>
        </form>
      </Card>

      <Card title="Appointment Slots">
        <form onSubmit={saveSchedule} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1 text-sm text-cream/70">
            Open
            <input
              type="time"
              required
              value={schedule.open_time}
              onChange={(e) => setSchedule((s) => ({ ...s, open_time: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-cream/70">
            Close
            <input
              type="time"
              required
              value={schedule.close_time}
              onChange={(e) => setSchedule((s) => ({ ...s, close_time: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-cream/70">
            Slot length (minutes)
            <input
              type="number"
              min="5"
              step="5"
              required
              value={schedule.slot_duration_minutes}
              onChange={(e) => setSchedule((s) => ({ ...s, slot_duration_minutes: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-cream/70">
            Capacity per slot
            <input
              type="number"
              min="1"
              step="1"
              required
              value={schedule.capacity_per_slot}
              onChange={(e) => setSchedule((s) => ({ ...s, capacity_per_slot: e.target.value }))}
              className={inputClass}
            />
          </label>
          <button type="submit" className={buttonClass}>
            Save Slot Settings
          </button>
        </form>
      </Card>

      <Card title="Notification Emails">
        <p className="mb-3 max-w-md text-sm text-cream/60">
          Email addresses notified whenever a customer checks in. One per line or comma-separated.
        </p>
        <form onSubmit={saveEmails} className="flex flex-col gap-3">
          <textarea
            rows={4}
            placeholder="owner@yourbarbershop.com"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            className={`${inputClass} w-full max-w-sm`}
          />
          <button type="submit" className={`${buttonClass} self-start`}>
            Save Notification Emails
          </button>
          {emailsMessage && <p className="text-sm text-cream/60">{emailsMessage}</p>}
        </form>
      </Card>

      <Card title="Manage Time Slots">
        <label className="mb-3 flex items-center gap-2 text-sm text-cream/70">
          Date:
          <DatePickerField value={blockDate} minDate={todayIso()} onChange={setBlockDate} />
        </label>
        <p className="mb-3 max-w-md text-sm text-cream/60">
          Click a normal time to block/unblock it. Extra times (blue) can be removed by clicking them.
        </p>
        <div className="mb-4 flex max-w-xl flex-wrap gap-2">
          {slots.map((slot) => {
            let classes = "rounded-lg border px-3 py-2 text-sm transition-colors";
            if (slot.included && slot.blocked) classes += " border-purple-500 bg-purple-700 text-white";
            else if (slot.included) classes += " border-blue-500 bg-blue-700 text-white";
            else if (slot.blocked) classes += " border-red-700 bg-red-800 text-white line-through";
            else classes += " border-charcoal-lighter bg-ink text-cream hover:border-gold";
            return (
              <button
                key={slot.time}
                type="button"
                title={slot.included ? "Extra time — click to remove" : "Click to block/unblock"}
                onClick={() => handleSlotClick(slot)}
                className={classes}
              >
                {slot.time.slice(0, 5)}
              </button>
            );
          })}
        </div>
        <form onSubmit={addExtraTime} className="flex items-center gap-3">
          <input type="time" required value={newTime} onChange={(e) => setNewTime(e.target.value)} className={inputClass} />
          <button type="submit" className={buttonOutlineClass}>
            Add Extra Time for This Date
          </button>
        </form>
      </Card>
    </div>
  );
}
