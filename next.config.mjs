/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AnimalReference images may later be served from the animals archive or a CDN.
    // Add remote hosts here when image sources move off /public.
    remotePatterns: [],
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
