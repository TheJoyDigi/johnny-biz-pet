/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rkxekzzsirzujyuezvru.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'gqrbrrticbnibvnglwvs.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'dsnjzdtfezcsctdjlsje.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
}

module.exports = nextConfig
