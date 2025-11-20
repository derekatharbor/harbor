/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@harbor/db', '@harbor/adapters'],
  images: {
    domains: [],
  },
  // Don't try to access env vars at build time
  // They're automatically available as NEXT_PUBLIC_ vars in the browser
}

module.exports = nextConfig