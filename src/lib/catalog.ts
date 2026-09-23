import { db } from "./db";
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compareAt: number | null;
  images: string[];
  featured: boolean;
  fabric: string | null;
  pieceType: string | null;
  work: string | null;
  fit: string | null;
  sizeChart: string | null;
  pieces: Piece[];
  variants: { id: string; size: string; color: string; stock: number }[];
};
export type Piece = { name: string; fabric: string; colour: string };
// Pieces are stored as JSON; drop anything malformed rather than trusting it.
export function parsePieces(value: unknown): Piece[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (p): p is Piece =>
      !!p &&
      typeof p === "object" &&
      typeof p.name === "string" &&
      typeof p.fabric === "string" &&
      typeof p.colour === "string",
  );
}
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
export const categories = ["Women", "Men", "Formals"] as const;
export const editorial = {
  hero: photo("photo-1733470324488-d0e10d014d80"),
  heroPanels: [
    photo("photo-1733470381571-c3d082e68457"),
    photo("photo-1733470324488-d0e10d014d80"),
    photo("photo-1733470381436-bb5a2a441708"),
  ],
  story: photo("photo-1680034976848-d9fe95466aba"),
  women: photo("photo-1733470381436-bb5a2a441708"),
  men: photo("photo-1734418038940-2e5ee6a1b478"),
  formals: photo("photo-1721324807083-e9ddaa99310e"),
};
// Sample catalog for preview and seeding. Replace with approved brand data.
const entries: {
  slug: string;
  name: string;
  category: (typeof categories)[number];
  price: number;
  compareAt?: number;
  color: string;
  photos: string[];
  description: string;
}[] = [
  {
    slug: "lemon-organza-3-piece",
    name: "Lemon Organza 3-Piece",
    category: "Women",
    price: 1490000,
    compareAt: 1750000,
    color: "Lemon",
    photos: ["photo-1733470324488-d0e10d014d80"],
    description:
      "An embroidered organza shirt with a scalloped hem, paired with straight trousers and a sheer organza dupatta. Light enough for summer evenings, detailed enough for festive days.",
  },
  {
    slug: "crimson-chikankari-suit",
    name: "Crimson Chikankari Suit",
    category: "Women",
    price: 1245000,
    color: "Crimson",
    photos: ["photo-1733470381571-c3d082e68457"],
    description:
      "Deep crimson lawn worked with all-over chikankari, finished with embroidered cuffs and a matching dupatta. A 3-piece stitched suit for dholkis, dinners and Eid mornings.",
  },
  {
    slug: "lilac-pearl-embroidered-suit",
    name: "Lilac Pearl Embroidered Suit",
    category: "Women",
    price: 1390000,
    color: "Lilac",
    photos: ["photo-1733470381436-bb5a2a441708"],
    description:
      "A soft lilac kameez with tonal thread and pearl embroidery at the neckline, cigarette trousers and a printed chiffon dupatta.",
  },
  {
    slug: "lavender-organza-kurta",
    name: "Lavender Organza Kurta",
    category: "Women",
    price: 1150000,
    color: "Lavender",
    photos: ["photo-1705920824583-0e783235394d"],
    description:
      "Floaty lavender organza with delicate resham embroidery and a matching embroidered dupatta. Lined for comfort and easy to style for day-to-evening events.",
  },
  {
    slug: "mint-chikankari-co-ord",
    name: "Mint Chikankari Co-ord",
    category: "Women",
    price: 895000,
    color: "Mint",
    photos: ["photo-1733209589578-97136bee7d7a"],
    description:
      "A relaxed mint kurta in breathable cotton, hand-finished with chikankari panels, paired with matching straight pants. Made for long, warm days.",
  },
  {
    slug: "blush-embroidered-kurta-set",
    name: "Blush Embroidered Kurta Set",
    category: "Women",
    price: 790000,
    color: "Blush",
    photos: ["photo-1733209484732-6b094322a89f"],
    description:
      "A blush pink kurta with embroidered sleeves and a soft, easy fit, paired with straight trousers. A 2-piece set for everyday elegance.",
  },
  {
    slug: "marigold-printed-lawn",
    name: "Marigold Printed Lawn",
    category: "Women",
    price: 745000,
    color: "Marigold",
    photos: ["photo-1701252072712-e939599623f2"],
    description:
      "Sunny marigold lawn with a printed chiffon dupatta in woven stripes. Breathable, bright and made for summer.",
  },
  {
    slug: "butter-lawn-2-piece",
    name: "Butter Lawn 2-Piece",
    category: "Women",
    price: 695000,
    color: "Butter",
    photos: [
      "photo-1733209587923-77ff33202f7c",
      "photo-1733209589780-ece842d0dcf8",
    ],
    description:
      "A butter-yellow lawn kurta with subtle embroidered details and matching trousers. Your easy, go-to piece for work and weekends.",
  },
  {
    slug: "plum-raw-silk-kurta",
    name: "Plum Raw Silk Kurta",
    category: "Women",
    price: 980000,
    color: "Plum",
    photos: ["photo-1733731402869-57e0cce24aea"],
    description:
      "Rich plum raw silk with contrast embroidery along the placket and hem. A long, straight silhouette that works for evening dawats.",
  },
  {
    slug: "classic-white-kameez-shalwar",
    name: "Classic White Kameez Shalwar",
    category: "Men",
    price: 590000,
    color: "White",
    photos: [
      "photo-1734418038940-2e5ee6a1b478",
      "photo-1734418038517-ffc3a6a6751f",
      "photo-1734418040900-e964f84e8abb",
    ],
    description:
      "Crisp white cotton kameez shalwar with a classic collar and clean lines. The essential for Jummah, Eid and every occasion in between.",
  },
  {
    slug: "charcoal-kurta-shalwar",
    name: "Charcoal Kurta Shalwar",
    category: "Men",
    price: 650000,
    color: "Charcoal",
    photos: ["photo-1710624125523-3420db282dfe"],
    description:
      "A charcoal wash-and-wear kurta with a band collar, paired with a white shalwar. Wrinkle-resistant and easy to care for.",
  },
  {
    slug: "royal-blue-kameez-shalwar",
    name: "Royal Blue Kameez Shalwar",
    category: "Men",
    price: 690000,
    color: "Royal Blue",
    photos: ["photo-1770359993283-a2c2f386584e"],
    description:
      "Rich royal blue suiting fabric with a tailored kameez and matching shalwar. Smart enough for weddings, comfortable enough for all day.",
  },
  {
    slug: "pistachio-chikan-kurta",
    name: "Pistachio Chikan Kurta",
    category: "Men",
    price: 745000,
    color: "Pistachio",
    photos: ["photo-1727835523545-70ee992b5763"],
    description:
      "Soft pistachio cotton with all-over chikan embroidery. A festive kurta for mehndi and Eid, best paired with white shalwar or pajama.",
  },
  {
    slug: "butter-cotton-kurta",
    name: "Butter Cotton Kurta",
    category: "Men",
    price: 495000,
    color: "Butter",
    photos: ["photo-1701365676249-9d7ab5022dec"],
    description:
      "A lightweight butter-yellow cotton kurta with a band collar and concealed placket. Cool, easy and perfect for summer gatherings.",
  },
  {
    slug: "slate-grey-kameez-shalwar",
    name: "Slate Grey Kameez Shalwar",
    category: "Men",
    price: 545000,
    color: "Slate Grey",
    photos: ["photo-1785613590746-f57d638c7d38"],
    description:
      "A slate grey kameez shalwar in soft, breathable fabric with a relaxed fit. An everyday staple that looks sharp all day.",
  },
  {
    slug: "scarlet-zardozi-bridal-lehenga",
    name: "Scarlet Zardozi Bridal Lehenga",
    category: "Formals",
    price: 18500000,
    color: "Scarlet",
    photos: [
      "photo-1721324807083-e9ddaa99310e",
      "photo-1707576618343-26a1b377ca7a",
    ],
    description:
      "Our signature bridal lehenga in scarlet, hand-worked with zardozi, dabka and sequins. Includes an embellished choli and a scalloped net dupatta. Made to order.",
  },
  {
    slug: "peacock-formal-gharara",
    name: "Peacock Formal Gharara",
    category: "Formals",
    price: 9500000,
    color: "Peacock",
    photos: [
      "photo-1747847471528-7b95ea7a4c39",
      "photo-1747847471517-952a3eb93a89",
    ],
    description:
      "A peacock-blue formal gharara with gold tilla work and an embroidered dupatta. Designed for walimas, baraats and grand family occasions.",
  },
  {
    slug: "midnight-velvet-shawl-suit",
    name: "Midnight Velvet Shawl Suit",
    category: "Formals",
    price: 1850000,
    compareAt: 2200000,
    color: "Black",
    photos: [
      "photo-1704119142483-1269733bcedb",
      "photo-1733470381591-c5dfb9df3c3d",
    ],
    description:
      "Plush black velvet with silver embroidery, paired with trousers and an embroidered net shawl. A winter formal for weddings and evening events.",
  },
];
// [fabric, pieces label, work, fit, size chart set, [piece, fabric][]]
const specs: Record<
  string,
  [string, string, string, string, string, [string, string][]]
> = {
  "lemon-organza-3-piece": [
    "Organza",
    "3 Piece",
    "Embroidered",
    "Regular Fit Straight Shirt",
    "women-suit",
    [
      ["Shirt", "Embroidered Organza"],
      ["Trouser", "Cambric"],
      ["Dupatta", "Organza"],
    ],
  ],
  "crimson-chikankari-suit": [
    "Lawn",
    "3 Piece",
    "Embroidered",
    "Regular Fit A-Line Shirt",
    "women-suit",
    [
      ["Shirt", "Chikankari Lawn"],
      ["Trouser", "Cambric"],
      ["Dupatta", "Chiffon"],
    ],
  ],
  "lilac-pearl-embroidered-suit": [
    "Lawn",
    "3 Piece",
    "Embroidered",
    "Regular Fit Straight Shirt",
    "women-suit",
    [
      ["Shirt", "Embroidered Lawn"],
      ["Cigarette Pants", "Cambric"],
      ["Dupatta", "Printed Chiffon"],
    ],
  ],
  "lavender-organza-kurta": [
    "Organza",
    "2 Piece",
    "Embroidered",
    "Relaxed Fit Straight Kurta",
    "women-suit",
    [
      ["Kurta", "Embroidered Organza"],
      ["Dupatta", "Organza"],
    ],
  ],
  "mint-chikankari-co-ord": [
    "Cotton",
    "2 Piece",
    "Embroidered",
    "Relaxed Fit Straight Kurta",
    "women-suit",
    [
      ["Kurta", "Chikankari Cotton"],
      ["Straight Pants", "Cotton"],
    ],
  ],
  "blush-embroidered-kurta-set": [
    "Cambric",
    "2 Piece",
    "Embroidered",
    "Regular Fit Straight Kurta",
    "women-suit",
    [
      ["Kurta", "Embroidered Cambric"],
      ["Trouser", "Cambric"],
    ],
  ],
  "marigold-printed-lawn": [
    "Lawn",
    "3 Piece",
    "Printed",
    "Regular Fit A-Line Shirt",
    "women-suit",
    [
      ["Shirt", "Printed Lawn"],
      ["Trouser", "Cambric"],
      ["Dupatta", "Striped Chiffon"],
    ],
  ],
  "butter-lawn-2-piece": [
    "Lawn",
    "2 Piece",
    "Solid",
    "Regular Fit Straight Shirt",
    "women-suit",
    [
      ["Shirt", "Lawn"],
      ["Trouser", "Cambric"],
    ],
  ],
  "plum-raw-silk-kurta": [
    "Raw Silk",
    "1 Piece",
    "Embroidered",
    "Regular Fit Long Kurta",
    "women-shirt",
    [["Kurta", "Embroidered Raw Silk"]],
  ],
  "classic-white-kameez-shalwar": [
    "Cotton",
    "2 Piece",
    "Solid",
    "Regular Fit Kameez",
    "men-suit",
    [
      ["Kameez", "Cotton"],
      ["Shalwar", "Cotton"],
    ],
  ],
  "charcoal-kurta-shalwar": [
    "Wash & Wear",
    "2 Piece",
    "Solid",
    "Regular Fit Kurta",
    "men-suit",
    [
      ["Kurta", "Wash & Wear"],
      ["Shalwar", "Cotton"],
    ],
  ],
  "royal-blue-kameez-shalwar": [
    "Wash & Wear",
    "2 Piece",
    "Solid",
    "Tailored Fit Kameez",
    "men-suit",
    [
      ["Kameez", "Wash & Wear"],
      ["Shalwar", "Wash & Wear"],
    ],
  ],
  "pistachio-chikan-kurta": [
    "Cotton",
    "1 Piece",
    "Embroidered",
    "Regular Fit Kurta",
    "men-kurta",
    [["Kurta", "Chikan Cotton"]],
  ],
  "butter-cotton-kurta": [
    "Cotton",
    "1 Piece",
    "Solid",
    "Regular Fit Kurta",
    "men-kurta",
    [["Kurta", "Cotton"]],
  ],
  "slate-grey-kameez-shalwar": [
    "Cotton",
    "2 Piece",
    "Solid",
    "Relaxed Fit Kameez",
    "men-suit",
    [
      ["Kameez", "Cotton"],
      ["Shalwar", "Cotton"],
    ],
  ],
  "scarlet-zardozi-bridal-lehenga": [
    "Net",
    "3 Piece",
    "Embroidered",
    "Fitted Choli with Flared Lehenga",
    "women-suit",
    [
      ["Choli", "Zardozi Raw Silk"],
      ["Lehenga", "Embellished Net"],
      ["Dupatta", "Scalloped Net"],
    ],
  ],
  "peacock-formal-gharara": [
    "Raw Silk",
    "3 Piece",
    "Embroidered",
    "Regular Fit Short Shirt",
    "women-suit",
    [
      ["Shirt", "Tilla Raw Silk"],
      ["Gharara", "Raw Silk"],
      ["Dupatta", "Embroidered Net"],
    ],
  ],
  "midnight-velvet-shawl-suit": [
    "Velvet",
    "3 Piece",
    "Embroidered",
    "Regular Fit Straight Shirt",
    "women-suit",
    [
      ["Shirt", "Embroidered Velvet"],
      ["Trouser", "Cambric"],
      ["Shawl", "Embroidered Net"],
    ],
  ],
};
export const demoProducts: Product[] = entries.map((e, i) => ({
  id: e.slug,
  slug: e.slug,
  name: e.name,
  category: e.category,
  price: e.price,
  compareAt: e.compareAt ?? null,
  description: e.description,
  images: e.photos.map(photo),
  fabric: specs[e.slug][0],
  pieceType: specs[e.slug][1],
  work: specs[e.slug][2],
  fit: specs[e.slug][3],
  sizeChart: specs[e.slug][4],
  pieces: specs[e.slug][5].map(([name, fabric]) => ({
    name,
    fabric,
    colour: e.color,
  })),
  featured: i < 4 || e.category === "Formals",
  variants: ["XS", "S", "M", "L", "XL"].map((size) => ({
    id: `${e.slug}-${size}`,
    size,
    color: e.color,
    stock: e.category === "Formals" ? 3 : 12,
  })),
}));
export async function getProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return demoProducts;
  const products = await db.product.findMany({
    where: { active: true },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({ ...p, pieces: parsePieces(p.pieces) }));
}
export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}
export const money = (value: number) =>
  `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value / 100)}`;
