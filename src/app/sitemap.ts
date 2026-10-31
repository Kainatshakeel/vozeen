import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com";
  const products = await getProducts();
  return [
    ...[
      "",
      "/shop",
      "/about",
      "/contact",
      "/shipping",
      "/returns",
      "/size-guide",
    ].map((path) => ({
      url: `${site}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${site}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
