import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app es 100% cliente (localStorage, Web Audio, navigator.vibrate),
  // así que exportamos HTML estático para servirla desde Cloudflare Pages
  // u otro CDN sin necesidad de servidor.
  output: "export",
};

export default nextConfig;
