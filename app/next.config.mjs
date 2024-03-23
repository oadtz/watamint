/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nftstorage.link",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
}

export default nextConfig
