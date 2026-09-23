import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/checkout", "/orders/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com"}/sitemap.xml`,
  };
}
