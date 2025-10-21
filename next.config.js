/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // Fix framer-motion build issues
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })
    
    return config
  },
  // Disable static generation to prevent SSR issues with framer-motion
  output: 'standalone',
  images: {
    // Avoid expensive image work during local builds
    unoptimized: process.env.CI !== 'true',
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'mineihnvptbfkqdfcrzg.supabase.co' },
    ],
  },
  typescript: {
    // Prevent TS check from hanging local builds; CI will still check types
    ignoreBuildErrors: process.env.CI !== 'true',
  },
  eslint: {
    // Lint in CI, not during local prod builds
    ignoreDuringBuilds: process.env.CI !== 'true',
  },
}

module.exports = nextConfig 