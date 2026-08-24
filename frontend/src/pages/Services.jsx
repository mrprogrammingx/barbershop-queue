import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import ServicesGrid from "../sections/ServicesGrid";

export default function Services() {
  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title="Services & Pricing"
        subtitle="Every cut, shave, and beard sculpt finishes with a straight-razor line-up. No exceptions."
      />
      <Section>
        <ServicesGrid showCta />
      </Section>
    </>
  );
}
