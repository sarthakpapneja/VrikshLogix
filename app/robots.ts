import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/privacy", "/terms"],
      disallow: ["/dashboard/", "/auth/", "/api/"],
    },
    sitemap: "https://vrikshlogix.app/sitemap.xml",
  };
}
