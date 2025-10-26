/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { 
    forceSwcTransforms: true,
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
  images: {
    // Helpful for local dev when new hosts appear
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },   // Google OAuth avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'mineihnvptbfkqdfcrzg.supabase.co' },
    ],
  },
};

module.exports = nextConfig; 