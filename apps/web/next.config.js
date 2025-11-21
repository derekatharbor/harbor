/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@harbor/db', '@harbor/adapters'],
  images: {
    domains: [],
  },
  
  // Rewrite /brands/[slug]/harbor.json to /api/feed/[slug]
  // This gives us the canonical URL structure while keeping the working API route
  async rewrites() {
    return [
      {
        source: '/brands/:slug/harbor.json',
        destination: '/api/feed/:slug'
      }
    ]
  },
  
  // Webpack config to handle @napi-rs/canvas
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas so webpack doesn't try to bundle the native binaries
      config.externals.push({
        '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
      })
    }
    
    // Ignore .node files (native binaries)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })
    
    return config
  },
}

module.exports = nextConfig