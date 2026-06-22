import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Pin the file-tracing root to this project. Without it, Next infers the
  // workspace root from the nearest lockfile and warns when several exist.
  outputFileTracingRoot: __dirname,

  // Add security headers - SELECTIVE blocking for Teams/About pages only
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'Referrer-Policy',
        value: 'no-referrer',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
      {
        key: 'Origin-Agent-Cluster',
        value: '?1',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
      // Content-Security-Policy is set in src/middleware.ts so it can carry a
      // fresh per-request nonce (a static header here can't). See that file.
    ];

    // Enable HSTS only after HTTPS is fully configured on your domain.
    if (process.env.ENABLE_HSTS === 'true') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return [
      {
        // General security headers for ALL routes (does NOT block SEO)
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Teams route — indexable
        source: '/teams/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // About route — indexable
        source: '/about/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // Contact route is indexable for discoverability
        source: '/contact/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // Allow homepage to be indexed (explicitly enable SEO)
        source: '/',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // Allow other pages to be indexed for SEO
        source: '/projects/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // Allow ventures to be indexed
        source: '/ventures/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      // Add more routes you want indexed for SEO
    ];
  },

  // Webpack configuration to remove source maps in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Remove source maps in production to prevent code inspection
      config.devtool = false;
    }
    return config;
  },

  // Prevent source maps from leaking to the browser in production
  productionBrowserSourceMaps: false,

  // Disable X-Powered-By header (security best practice)
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Environment variables for additional control
  env: {
    // Set to 'false' in production to completely hide executive data
    NEXT_PUBLIC_SHOW_EXECUTIVES: process.env.NEXT_PUBLIC_SHOW_EXECUTIVES || 'true',
  },
};

export default nextConfig;
