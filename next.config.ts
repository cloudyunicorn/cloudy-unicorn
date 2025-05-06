// next.config.ts
import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // any other Next.js options you need
};

const config = process.env.NODE_ENV === 'production'
  ? withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: false,
      scope: '/',
      sw: 'sw.js',
      publicExcludes: ['!noprecache/**/*'],
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offlineCache',
            expiration: {
              maxEntries: 200,
            },
          },
        },
      ],
      buildExcludes: [
        /middleware-manifest\.json$/,
        /_middleware\.js$/,
        /_buildManifest\.js$/,
        /_ssgManifest\.js$/,
        /app-build-manifest\.json$/,
      ],
      manifest: {
        name: 'CyberSculpt',
        short_name: 'CyberSculpt',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
      },
    })(nextConfig)
  : nextConfig;

export default config;
