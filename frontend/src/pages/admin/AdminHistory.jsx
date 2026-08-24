import { useEffect, useState } from "react";
import { getHistoryDates, getHistoryForDate } from "../../lib/adminApi";
import { Table, inputClass } from "../../components/admin/ui";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </label>
      <p className="text-sm text-cream/50">
        {dates.length > 0 ? `Dates with history: ${dates.join(", ")}` : "No past queue history yet."}
      </p>

      {entries.length === 0 ? (
        <p className="text-cream/50">No queue entries for this date.</p>
      ) : (
        <Table columns={["#", "Time", "Name", "Phone", "Note", "Status", "Checked In"]}>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-charcoal-lighter">
              <td className="px-3 py-2">{entry.position}</td>
              <td className="px-3 py-2">{entry.appointment_time.slice(0, 5)}</td>
              <td className="px-3 py-2">{entry.customer.name}</td>
              <td className="px-3 py-2">{entry.customer.phone}</td>
              <td className="px-3 py-2">{entry.note || ""}</td>
              <td className="px-3 py-2 capitalize">{entry.status.replace("_", " ")}</td>
              <td className="px-3 py-2">{new Date(entry.created_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
