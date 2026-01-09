/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://phpstack-1490006-6107283.cloudwaysapps.com/api/:path*", // Backend API URL
      },
    ];
  },
};

export default nextConfig;
