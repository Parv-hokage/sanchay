/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sanchay/types', '@sanchay/shared', '@sanchay/validation'],
};

module.exports = nextConfig;
