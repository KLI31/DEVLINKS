import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/dashboard", "/api/"],
      },
    ],
    sitemap: "https://devlinks.nova11labs.dev/sitemap.xml",
  };
}
