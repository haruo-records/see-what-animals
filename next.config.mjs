/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AnimalReference images may later be served from the animals archive or a CDN.
    // Add remote hosts here when image sources move off /public.
    remotePatterns: [],
  },
  async redirects() {
    // Home and the game are one page now; the old /observe URL folds into /.
    return [{ source: "/observe", destination: "/", permanent: true }];
  },
};

export default nextConfig;
