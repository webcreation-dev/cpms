import type { NextConfig } from "next";
import legacyRedirects from "./src/generated/cpms-redirects.json";

const nextConfig: NextConfig = {
  // Les plugins historiques manipulent le DOM après l'hydratation.
  // Aucun reset CSS, aucune police Next et aucune optimisation d'image
  // ne sont ajoutés à cette reproduction du template.
  devIndicators: false,
  async redirects() { return legacyRedirects; },
};

export default nextConfig;
