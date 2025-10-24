/** @type {import('next').NextConfig} */
const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';

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
    unoptimized: !isCI,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'mineihnvptbfkqdfcrzg.supabase.co' },
    ],
  },
  typescript: {
    // Prevent TS check from hanging local builds; CI will still check types
    ignoreBuildErrors: !isCI,
  },
  eslint: {
    // Lint in CI, not during local prod builds
    ignoreDuringBuilds: !isCI,
  },
  reactStrictMode: true,
}

module.exports = nextConfig 