/**
 * Sample thrift inventory so the app never looks empty during the demo.
 * Photos are public Unsplash URLs (the phone loads them over Wi-Fi).
 */
module.exports = [
  {
    name: "Vintage Levi's Denim Jacket",
    description:
      "Classic trucker cut in a lightly faded mid-blue wash. Broken in exactly where it should be, with the boxy 90s fit that is impossible to find new. Original brass buttons, no replacements.",
    brand: "Levi's",
    category: 'Jackets',
    size: 'M',
    condition: 'Excellent',
    conditionNotes:
      'Light natural fading at the cuffs and collar. All buttons intact, no rips or stains.',
    price: 1250,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=900&q=80',
    ],
  },
  {
    name: '90s Graphic Tee',
    description:
      'Single-stitch cotton tee with a faded screen print. Soft, thin and perfectly worn in. Fits true to a modern medium.',
    brand: 'Hanes',
    category: 'Tops',
    size: 'L',
    condition: 'Good',
    conditionNotes:
      'Print has natural cracking from age (part of the look). Small fading near the sleeve but no holes or major stains.',
    price: 450,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=900&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80',
    ],
  },
  {
    name: 'Brown Corduroy Overshirt',
    description:
      'Warm chocolate-brown corduroy shirt jacket with two chest pockets. Heavy wale, holds its shape well, layers over a tee or a knit.',
    brand: 'Uniqlo',
    category: 'Tops',
    size: 'M',
    condition: 'Like New',
    conditionNotes: 'Barely worn. Corduroy still full and even, no flattening at the elbows.',
    price: 850,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&q=80',
    ],
  },
  {
    name: 'Vintage Nike Windbreaker',
    description:
      'Colour-blocked nylon windbreaker with an embroidered swoosh and a half-zip collar. Light, packable, very 90s track-and-field.',
    brand: 'Nike',
    category: 'Jackets',
    size: 'L',
    condition: 'Excellent',
    conditionNotes: 'Zip runs smoothly. One tiny scuff on the lower back panel, barely visible.',
    price: 1150,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1552327805-30cb8d1c8f38?w=900&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900&q=80',
    ],
  },
  {
    name: 'Y2K Shoulder Bag',
    description:
      'Compact faux-leather baguette bag with a short strap and a silver-tone clasp. Fits a phone, a wallet and keys.',
    brand: 'No Brand',
    category: 'Bags',
    size: 'One Size',
    condition: 'Good',
    conditionNotes: 'Light creasing on the flap and small wear on the corners. Lining is clean.',
    price: 650,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
    ],
  },
  {
    name: 'Washed Black Carpenter Jeans',
    description:
      'Straight-leg carpenter jeans in a soft washed black with a hammer loop and a wide utility pocket. Sits at the waist, no stretch.',
    brand: 'Dickies',
    category: 'Bottoms',
    size: '32',
    condition: 'Good',
    conditionNotes: 'Even fading throughout. Hem shows light wear, no fraying holes.',
    price: 750,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=900&q=80',
    ],
  },
  {
    name: 'Retro Knit Sweater',
    description:
      'Chunky patterned pullover in cream, rust and olive. Wool blend, roomy body, ribbed cuffs and hem.',
    brand: 'Vintage',
    category: 'Knitwear',
    size: 'M',
    condition: 'Excellent',
    conditionNotes: 'No pilling or moth holes. Colours are still strong.',
    price: 900,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80',
    ],
  },
  {
    name: 'Vintage Leather Jacket',
    description:
      'Genuine cowhide biker jacket with an asymmetric zip and a snap collar. Heavy, structured, and the patina only gets better.',
    brand: 'Wilsons Leather',
    category: 'Jackets',
    size: 'M',
    condition: 'Good',
    conditionNotes:
      'Natural patina and a few surface scratches on the sleeves. Lining intact, all zips working.',
    price: 2450,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=900&q=80',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=900&q=80',
    ],
  },
  {
    name: 'Faded Flannel Shirt',
    description:
      'Soft brushed-cotton flannel in muted red and charcoal check. Perfect open layer, already broken in.',
    brand: 'Vintage',
    category: 'Tops',
    size: 'L',
    condition: 'Good',
    conditionNotes: 'Colours softened from washing. One spare button included.',
    price: 520,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=80',
    ],
  },
  {
    name: 'Olive Military Field Jacket',
    description:
      'Four-pocket M-65 style field jacket in faded olive. Drawcord waist, button storm flap, roomy enough to layer a knit under.',
    brand: 'Surplus',
    category: 'Jackets',
    size: 'L',
    condition: 'Fair',
    conditionNotes:
      'Honest wear: fading on the shoulders and a small repaired seam near the left pocket. Structurally solid.',
    price: 980,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1591047139756-eec5b7e0d2ea?w=900&q=80',
      'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=900&q=80',
    ],
  },
  {
    name: 'Vintage Suede Loafers',
    description:
      'Tan suede penny loafers with a leather sole. Classic shape that works with denim or trousers.',
    brand: 'Bass',
    category: 'Shoes',
    size: '9',
    condition: 'Good',
    conditionNotes: 'Soles have wear but plenty of life left. Suede lightly brushed, no stains.',
    price: 1100,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=900&q=80',
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=900&q=80',
    ],
  },
  {
    name: 'Woven Leather Belt',
    description:
      'Hand-woven brown leather belt with an antique brass buckle. Adjustable anywhere along the weave.',
    brand: 'No Brand',
    category: 'Accessories',
    size: 'One Size',
    condition: 'Like New',
    conditionNotes: 'Almost unused. Leather is still stiff and even in colour.',
    price: 380,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80',
    ],
  },
];
