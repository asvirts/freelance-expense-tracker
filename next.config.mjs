/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Completely disable ESLint during builds
    ignoreDuringBuilds: true
  },
  typescript: {
    // Also ignore TypeScript errors
    ignoreBuildErrors: true
  }
}

export default nextConfig
