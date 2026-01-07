/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      // IPFS gateways commonly used by Farcaster
      {
        protocol: "https",
        hostname: "*.ipfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare-ipfs.com",
      },
      // Common CDNs and image hosting services
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "*.imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "cdn.farcaster.xyz",
      },
      {
        protocol: "https",
        hostname: "*.cdn.farcaster.xyz",
      },
      // Allow any HTTPS image (with unoptimized fallback)
      // This is a catch-all for dynamic Farcaster image URLs
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
