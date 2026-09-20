import type { MetadataRoute } from "next";
import { basePath } from "@/lib/base-path";

// Metadata routes are Route Handlers; a static export needs them pinned.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Polihole — political discussion decks",
    short_name: "Polihole",
    description:
      "Two discussion-starter card decks for political science students: Polihole and Politicize This.",
    // Manifest URLs are resolved against the origin, not the manifest's own
    // location, so every one of these carries the basePath.
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f4f2",
    theme_color: "#1e2bd4",
    icons: [
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
