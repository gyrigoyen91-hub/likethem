/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Force development server to use port 3000
  experimental: {
    // This ensures consistent port usage
  },
}

module.exports = nextConfig 