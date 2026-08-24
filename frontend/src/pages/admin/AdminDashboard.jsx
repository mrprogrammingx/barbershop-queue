import { useCallback, useEffect, useRef, useState } from "react";
import { getQueue, markDone, markNoShow, setNote } from "../../lib/adminApi";
import { EntryCard, EntryRow, StatusSelect, Table, inputClass } from "../../components/admin/ui";
import DatePickerField from "../../components/admin/DatePickerField";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [date, setDate] = useState(todayIso());
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState({});
  const noteInputFocused = useRef(false);

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

  async function handleStatusChange(id, newStatus) {
    if (newStatus === "done") await markDone(id);
    else if (newStatus === "no_show") await markNoShow(id);
    loadQueue();
  }

  async function handleNoteBlur(id) {
    noteInputFocused.current = false;
    await setNote(id, notes[id]);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">Staff Dashboard</h1>

      <label className="flex items-center gap-2 text-sm text-cream/70">
        Date:
        <DatePickerField value={date} minDate="2000-01-01" onChange={setDate} />
      </label>

      {entries.length === 0 ? (
        <p className="text-cream/50">No queue entries for this date.</p>
      ) : (
        <>
          <div className="hidden md:block">
            <Table columns={["#", "Time", "Name", "Phone", "Note", "Status"]}>
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
                    <StatusSelect status={entry.status} onChange={(next) => handleStatusChange(entry.id, next)} />
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
                  <StatusSelect status={entry.status} onChange={(next) => handleStatusChange(entry.id, next)} />
                </EntryRow>
              </EntryCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
