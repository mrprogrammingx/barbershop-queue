import { useEffect, useState } from "react";
import { getHistoryDates, getHistoryForDate } from "../../lib/adminApi";
import { EntryCard, EntryRow, StatusPill, Table } from "../../components/admin/ui";
import DatePickerField from "../../components/admin/DatePickerField";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminHistory() {
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState(todayIso());
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    getHistoryDates().then(setDates);
  }, []);

  useEffect(() => {
    if (date) getHistoryForDate(date).then(setEntries);
  }, [date]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">Queue History</h1>

      <label className="flex items-center gap-2 text-sm text-cream/70">
        Date:
        <DatePickerField value={date} minDate="2000-01-01" onChange={setDate} />
      </label>
      <p className="text-sm text-cream/50">
        {dates.length > 0 ? `Dates with history: ${dates.join(", ")}` : "No past queue history yet."}
      </p>

      {entries.length === 0 ? (
        <p className="text-cream/50">No queue entries for this date.</p>
      ) : (
        <>
          <div className="hidden md:block">
            <Table columns={["#", "Time", "Name", "Phone", "Note", "Status", "Checked In"]}>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-charcoal-lighter">
                  <td className="px-3 py-2">{entry.position}</td>
                  <td className="px-3 py-2">{entry.appointment_time.slice(0, 5)}</td>
                  <td className="px-3 py-2">{entry.customer.name}</td>
                  <td className="px-3 py-2">{entry.customer.phone}</td>
                  <td className="px-3 py-2">{entry.note || ""}</td>
                  <td className="px-3 py-2">
                    <StatusPill status={entry.status} />
                  </td>
                  <td className="px-3 py-2">{new Date(entry.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </Table>
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                title={`#${entry.position} · ${entry.appointment_time.slice(0, 5)}`}
              >
                <EntryRow label="Name">{entry.customer.name}</EntryRow>
                <EntryRow label="Phone">{entry.customer.phone}</EntryRow>
                {entry.note && <EntryRow label="Note">{entry.note}</EntryRow>}
                <EntryRow label="Status">
                  <StatusPill status={entry.status} />
                </EntryRow>
                <EntryRow label="Checked In">{new Date(entry.created_at).toLocaleTimeString()}</EntryRow>
              </EntryCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
