/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuration pour mobile
  experimental: {
    optimizeCss: false,
  },
  
  // Compression adaptative
  compress: process.env.NODE_ENV === 'production',
  
  // Configuration des images
  images: {
    domains: [
      'localhost', 
      '192.168.1.252',
      'res.cloudinary.com',
      'omcmotzlpzjkzbzqqzmf.supabase.co'
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  
  // Configuration du serveur
  async headers() {
    const headers = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];

    // Cache control pour développement
    if (process.env.NODE_ENV === 'development') {
      headers[0].headers.push({
        key: 'Cache-Control',
        value: 'no-store, must-revalidate',
      });
    }

    return headers;
  },

  // Optimisations de production
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

module.exports = nextConfig;