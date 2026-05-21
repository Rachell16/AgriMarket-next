/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig