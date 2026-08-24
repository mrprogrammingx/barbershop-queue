import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { callNext, getQueue, markDone, markNoShow, resetQueue, setNote } from "../../lib/adminApi";
import { EntryCard, EntryRow, StatusPill, Table, buttonClass, buttonOutlineClass, inputClass } from "../../components/admin/ui";
import { useAdminUI } from "../../components/admin/AdminUIContext";
import DatePickerField from "../../components/admin/DatePickerField";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const { confirm } = useAdminUI();
  const [date, setDate] = useState(todayIso());
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState({});
  const noteInputFocused = useRef(false);
  const isToday = date === todayIso();

  const loadQueue = useCallback(async () => {
    if (noteInputFocused.current) return;
    const data = await getQueue(date);
    setEntries(data);
    setNotes((prev) => {
      const next = { ...prev };
      for (const entry of data) {
        if (!(entry.id in next)) next[entry.id] = entry.note || "";
      }
      return next;
    });
  }, [date]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  async function handleStatus(id, action) {
    if (action === "done") await markDone(id);
    else await markNoShow(id);
    loadQueue();
  }

  async function handleNoteBlur(id) {
    noteInputFocused.current = false;
    await setNote(id, notes[id]);
  }

  async function handleCallNext() {
    await callNext();
    loadQueue();
  }

  async function handleReset() {
    if (await confirm("Reset today's queue? This clears every entry checked in today.")) {
      await resetQueue();
      loadQueue();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">Staff Dashboard</h1>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-cream/70">
          Date:
          <DatePickerField value={date} minDate="2000-01-01" onChange={setDate} />
        </label>
        <button type="button" disabled={!isToday} onClick={handleCallNext} className={buttonClass}>
          Call Next
        </button>
        <button type="button" disabled={!isToday} onClick={handleReset} className={buttonOutlineClass}>
          Reset Queue
        </button>
      </div>
      {!isToday && (
        <p className="max-w-md text-sm text-cream/50">Call Next and Reset Queue only apply to today's queue.</p>
      )}

      {entries.length === 0 ? (
        <p className="text-cream/50">No queue entries for this date.</p>
      ) : (
        <>
          <div className="hidden md:block">
            <Table columns={["#", "Time", "Name", "Phone", "Note", "Status", "Actions"]}>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-charcoal-lighter">
                  <td className="px-3 py-2">{entry.position}</td>
                  <td className="px-3 py-2">{entry.appointment_time.slice(0, 5)}</td>
                  <td className="px-3 py-2">{entry.customer.name}</td>
                  <td className="px-3 py-2">{entry.customer.phone}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Note"
                      value={notes[entry.id] ?? ""}
                      onFocus={() => {
                        noteInputFocused.current = true;
                      }}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                      onBlur={() => handleNoteBlur(entry.id)}
                      className={`${inputClass} w-full`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={entry.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleStatus(entry.id, "done")} className={buttonClass}>
                        Done
                      </button>
                      <button type="button" onClick={() => handleStatus(entry.id, "no-show")} className={buttonOutlineClass}>
                        No-show
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                title={`#${entry.position} · ${entry.appointment_time.slice(0, 5)}`}
                headerActions={
                  <>
                    <button
                      type="button"
                      aria-label="Mark done"
                      onClick={() => handleStatus(entry.id, "done")}
                      className="rounded-full border border-emerald-500/40 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Mark no-show"
                      onClick={() => handleStatus(entry.id, "no-show")}
                      className="rounded-full border border-red-500/40 p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <X size={16} />
                    </button>
                  </>
                }
                footer={
                  <div className="border-t border-charcoal-lighter px-4 py-3">
                    <input
                      type="text"
                      placeholder="Add a note"
                      value={notes[entry.id] ?? ""}
                      onFocus={() => {
                        noteInputFocused.current = true;
                      }}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                      onBlur={() => handleNoteBlur(entry.id)}
                      className={`${inputClass} w-full`}
                    />
                  </div>
                }
              >
                <EntryRow label="Name">{entry.customer.name}</EntryRow>
                <EntryRow label="Phone">{entry.customer.phone}</EntryRow>
                <EntryRow label="Status">
                  <StatusPill status={entry.status} />
                </EntryRow>
              </EntryCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
