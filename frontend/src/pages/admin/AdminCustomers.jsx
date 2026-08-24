import { useEffect, useState } from "react";
import { getCustomers } from "../../lib/adminApi";
import { Table, buttonOutlineClass } from "../../components/admin/ui";
import DatePickerField from "../../components/admin/DatePickerField";

export default function AdminCustomers() {
  const [date, setDate] = useState("");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    getCustomers(date || undefined).then(setCustomers);
  }, [date]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl tracking-wide">Customers</h1>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-cream/70">
          Date:
          <DatePickerField value={date} minDate="2000-01-01" onChange={setDate} />
        </label>
        <button type="button" onClick={() => setDate("")} className={buttonOutlineClass}>
          Show All
        </button>
      </div>
      <p className="text-sm text-cream/50">
        {date ? `Showing customers booked on ${date}.` : "Showing all customers. Pick a date to see only who's booked that day."}
      </p>

      {customers.length === 0 ? (
        <p className="text-cream/50">No customers found.</p>
      ) : (
        <Table columns={["Name", "Phone", "Visits", "Signed Up"]}>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-charcoal-lighter">
              <td className="px-3 py-2">{customer.name}</td>
              <td className="px-3 py-2">{customer.phone}</td>
              <td className="px-3 py-2">{customer.visit_count}</td>
              <td className="px-3 py-2">{new Date(customer.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
