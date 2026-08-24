import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import GalleryGrid from "../sections/GalleryGrid";

export default function Gallery() {
  return (
    <>
      <PageHeader eyebrow="The Shop" title="Gallery" subtitle="Chairs, tools, and the work — click any photo to expand." />
      <Section>
        <GalleryGrid />
      </Section>
    </>
  );
}
