/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable untuk server components
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  // Jika pakai custom server, uncomment ini:
  // output: 'standalone',
  
  // Optimasi gambar
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack config untuk Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins]
    }
    return config
  },
}

module.exports = nextConfig