/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@harbor/db', '@harbor/adapters'],
  images: {
    domains: [],
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