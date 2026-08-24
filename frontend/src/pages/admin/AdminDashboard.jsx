import { useCallback, useEffect, useRef, useState } from "react";
import { callNext, getQueue, markDone, markNoShow, resetQueue, setNote } from "../../lib/adminApi";
import { Table, buttonClass, buttonOutlineClass, inputClass } from "../../components/admin/ui";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDashboard() {
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
    if (window.confirm("Reset today's queue?")) {
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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
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
              <td className="px-3 py-2 capitalize">{entry.status.replace("_", " ")}</td>
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
      )}
    </div>
  );
}
