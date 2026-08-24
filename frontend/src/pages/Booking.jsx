import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import BookingForm from "../sections/BookingForm";
import MyBookingsLookup from "../sections/MyBookingsLookup";

export default function Booking() {
  return (
    <>
      <PageHeader
        eyebrow="Reserve Your Chair"
        title="Book Your Appointment"
        subtitle="Pick a date, grab an open time, and you're in the queue — no account needed."
      />
      <Section>
        <BookingForm />
      </Section>
      <Section eyebrow="Already Booked?" title="Find Your Appointment" className="bg-charcoal/40">
        <MyBookingsLookup />
      </Section>
    </>
  );
}
