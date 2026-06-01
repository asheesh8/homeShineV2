import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeSHINE Field App",
    short_name: "HomeSHINE",
    description: "Field assessment app for HomeSHINE exterior care",
    start_url: "/",
    display: "standalone",
    background_color: "#182638",
    theme_color: "#182638",
    orientation: "portrait",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
