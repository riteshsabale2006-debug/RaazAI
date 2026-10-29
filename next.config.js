/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  // Ensure server-only code is not exposed to the client
  serverExternalPackages: [],
};

module.exports = nextConfig;
