/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Completely disable ESLint
    ignoreDuringBuilds: true,
    dirs: [] // Don't run ESLint on any directories
  },
  typescript: {
    // Disable TypeScript errors
    ignoreBuildErrors: true
  },
  experimental: {
    // Disable all linting telemetry
    disableStaticImages: false,
    disableOptimizedLoading: false,
    disablePostcssPresetEnv: false
  }
}

export default nextConfig
