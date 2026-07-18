/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AnimalReference images may later be served from the animals archive or a CDN.
    // Add remote hosts here when image sources move off /public.
    remotePatterns: [],
    // Registered works are SVG files written by the generator into
    // /public/specimens. Next refuses to serve SVG through next/image by
    // default, because an SVG from an untrusted source can carry script.
    // These are not untrusted: they are produced by generator/render/render-svg.ts
    // from a whitelist of primitive tags, with no script, no foreignObject and
    // no external reference — and the CSP below enforces that at serve time
    // regardless of what ends up in the directory.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      // Home and the game are one page now; the old /observe URL folds into /.
      { source: "/observe", destination: "/", permanent: true },
      // About was retired; the profile now lives on the Support page.
      { source: "/about", destination: "/support", permanent: true },
    ];
  },
};

export default nextConfig;
