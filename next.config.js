/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.ppy.sh",
      },
      {
        protocol: "https",
        hostname: "b.ppy.sh",
      },
      {
        protocol: "https",
        hostname: "a.ppy.sh",
      },
    ],
  },
}

module.exports = nextConfig
