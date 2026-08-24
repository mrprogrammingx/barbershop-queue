// Central place for shop content, imagery, and copy.
// Swap the Unsplash URLs below for real shop photography whenever it's ready —
// every image is referenced from here, nowhere else.

const unsplash = (id, params = "w=1600&q=80&auto=format&fit=crop") =>
  `https://images.unsplash.com/photo-${id}?${params}`;

export const SHOP = {
  name: "Parsa Barber",
  phones: ["+374 44 141378", "+374 94 141378"],
  email: "chair@parsabarber.com",
  address: "23 Mamikoniants St, Yerevan, Armenia 0014",
  mapEmbedSrc: "https://maps.google.com/maps?q=23+Mamikoniants+St&z=15&output=embed",
  instagram: "https://www.instagram.com/amirparsa.barber",
  instagramHandle: "@amirparsa.barber",
  telegram: "https://t.me/Amirparsabarber",
  telegramHandle: "@Amirparsabarber",
  whatsapp: "https://wa.me/37444141378",
  whatsappHandle: "@Amirparsabarber",
  hours: [
    { day: "Monday", time: "Closed" },
    { day: "Tuesday", time: "10:00 AM – 5:00 PM" },
    { day: "Wednesday", time: "10:00 AM – 5:00 PM" },
    { day: "Thursday", time: "10:00 AM – 5:00 PM" },
    { day: "Friday", time: "10:00 AM – 5:00 PM" },
    { day: "Saturday", time: "10:00 AM – 5:00 PM" },
    { day: "Sunday", time: "10:00 AM – 5:00 PM" },
  ],
};

export const HERO_IMAGE = unsplash("1585747860715-2ba37e788b70", "w=2400&q=80&auto=format&fit=crop");

export const SERVICES = [
  {
    id: "signature-fade",
    name: "Signature Fade",
    price: 45,
    duration: "45 min",
    description: "Precision skin or taper fade, finished with a straight-razor line-up.",
    featured: true,
  },
  {
    id: "classic-cut",
    name: "Classic Cut",
    price: 35,
    duration: "30 min",
    description: "Scissor-over-comb cut tailored to your face shape and hair type.",
  },
  {
    id: "beard-sculpt",
    name: "Beard Sculpt",
    price: 25,
    duration: "20 min",
    description: "Shape, line-up, and conditioning oil for a sharp, defined beard.",
  },
  {
    id: "hot-towel-shave",
    name: "Hot Towel Shave",
    price: 38,
    duration: "35 min",
    description: "Traditional straight-razor shave with hot towels and pre-shave oil.",
  },
  {
    id: "cut-beard-combo",
    name: "Cut + Beard Combo",
    price: 60,
    duration: "60 min",
    description: "The full package — signature fade or classic cut plus a beard sculpt.",
    featured: true,
  },
  {
    id: "junior-cut",
    name: "Junior Cut",
    price: 22,
    duration: "25 min",
    description: "For guests 12 and under. Same sharp standard, smaller chair.",
  },
];

export const GALLERY = [
  { id: "g1", src: unsplash("1585747860715-2ba37e788b70"), alt: "Barbershop interior with vintage chairs under warm lighting", tall: true },
  { id: "g2", src: unsplash("1592647420148-bfcc177e2117"), alt: "Vintage red barber chair against a wall of framed photos" },
  { id: "g3", src: unsplash("1599351431202-1e0f0137899a"), alt: "Close-up of a clipper fade in progress" },
  { id: "g4", src: unsplash("1493256338651-d82f7acb2b38"), alt: "Barber trimming the back of a client's neck", tall: true },
  { id: "g5", src: unsplash("1503951914875-452162b0f3f1"), alt: "Client receiving a hot towel beard shave" },
  { id: "g6", src: unsplash("1596728325488-58c87691e9af"), alt: "Straight razor beard trim with tattooed hands" },
  { id: "g7", src: unsplash("1517832606299-7ae9b720a186"), alt: "Black and white close-up of a straight razor shave" },
  { id: "g8", src: unsplash("1621605815971-fbc98d665033"), alt: "Barbering tools and grooming products laid out on a table", tall: true },
  { id: "g9", src: unsplash("1605497788044-5a32c7078486"), alt: "Barber styling a client's hair with a blow dryer" },
];

