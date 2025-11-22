const { withCloudflare } = require('@cloudflare/next-on-pages');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

module.exports = withCloudflare(nextConfig);