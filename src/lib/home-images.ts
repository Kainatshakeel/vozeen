import { db } from "./db";
import { UPLOAD_PATH } from "./uploads";
// Homepage photos. Each slot has a default file in public/images/home/ and can be
// replaced from the admin panel (Homepage tab). Replacements are stored in the
// SiteImage table; if it is missing or empty the defaults are used.
const file = (name: string) => `/images/home/${name}`;
export type Slot = {
  key: string;
  group: string;
  label: string;
  hint: string;
  fallback: string;
};
export const SLOTS: Slot[] = [
  {
    key: "hero-1",
    group: "Top slideshow",
    label: "Left panel — first photo",
    hint: "Portrait photo",
    fallback: file("hero-1.jpg"),
  },
  {
    key: "hero-2",
    group: "Top slideshow",
    label: "Middle panel — first photo",
    hint: "Portrait photo",
    fallback: file("hero-2.jpg"),
  },
  {
    key: "hero-3",
    group: "Top slideshow",
    label: "Right panel — first photo",
    hint: "Portrait photo",
    fallback: file("hero-3.jpg"),
  },
  {
    key: "hero-1b",
    group: "Top slideshow",
    label: "Left panel — second photo",
    hint: "Fades in after 5 seconds",
    fallback: file("hero-1b.jpg"),
  },
  {
    key: "hero-2b",
    group: "Top slideshow",
    label: "Middle panel — second photo",
    hint: "Fades in after 5 seconds",
    fallback: file("hero-2b.jpg"),
  },
  {
    key: "hero-3b",
    group: "Top slideshow",
    label: "Right panel — second photo",
    hint: "Fades in after 5 seconds",
    fallback: file("hero-3b.jpg"),
  },
  {
    key: "category-women",
    group: "Categories",
    label: "Women",
    hint: "Shop by occasion tile and the large Women banner",
    fallback: file("category-women.jpg"),
  },
  {
    key: "category-formals",
    group: "Categories",
    label: "Formals",
    hint: "Shop by occasion tile and the large Formals banner",
    fallback: file("category-formals.jpg"),
  },
  {
    key: "category-men",
    group: "Categories",
    label: "Men (coming soon tile)",
    hint: "Portrait photo",
    fallback: file("category-men.jpg"),
  },
  {
    key: "category-kids",
    group: "Categories",
    label: "Kids (coming soon tile)",
    hint: "Portrait photo",
    fallback: file("category-kids.jpg"),
  },
  {
    key: "banner",
    group: "Banners",
    label: "Festive banner",
    hint: "Wide photo behind “Dressed for every celebration”",
    fallback: file("banner.jpg"),
  },
  {
    key: "craft",
    group: "Banners",
    label: "Our craft",
    hint: "Embroidery close-up beside the craft story",
    fallback: file("craft.jpg"),
  },
];
// Current photo for every slot, plus whether the admin has replaced it.
export async function getHomeSlots() {
  const saved = new Map<string, string>();
  if (process.env.DATABASE_URL) {
    try {
      const rows = await db.$queryRaw<
        { slot: string; url: string }[]
      >`SELECT "slot", "url" FROM "SiteImage"`;
      for (const r of rows) if (UPLOAD_PATH.test(r.url)) saved.set(r.slot, r.url);
    } catch {
      // Table not created yet: fall back to the default photos.
    }
  }
  return SLOTS.map((s) => ({
    ...s,
    url: saved.get(s.key) ?? s.fallback,
    custom: saved.has(s.key),
  }));
}
export async function getHomeImages() {
  const url = Object.fromEntries(
    (await getHomeSlots()).map((s) => [s.key, s.url]),
  ) as Record<string, string>;
  return {
    hero: [url["hero-1"], url["hero-2"], url["hero-3"]],
    heroSecond: [url["hero-1b"], url["hero-2b"], url["hero-3b"]],
    categoryWomen: url["category-women"],
    categoryFormals: url["category-formals"],
    categoryMen: url["category-men"],
    categoryKids: url["category-kids"],
    banner: url["banner"],
    craft: url["craft"],
  };
}
