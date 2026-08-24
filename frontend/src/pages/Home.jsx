import Hero from "../sections/Hero";
import Section from "../components/Section";
import BookingForm from "../sections/BookingForm";

export default function Home() {
  return (
    <>
      <Hero />

      <Section eyebrow="Reserve Your Chair" title="Book Your Appointment">
        <BookingForm />
      </Section>
    </>
  );
}
