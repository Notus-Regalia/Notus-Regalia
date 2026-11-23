import type { NextConfig } from "next";
import { getFrameOrigins } from "./src/lib/frame-ancestors";

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

    // X-Frame-Options for pages/API is set per request in src/middleware.ts
    // (DENY, or omitted when PORTFOLIO_ORIGINS allows framing), because a
    // header set here can't be removed by middleware. Here we only cover the
    // paths the middleware matcher skips. This is evaluated at build time.
    // Keep this pattern in sync with `config.matcher` in src/middleware.ts.
    const frameHeaderRoutes =
      getFrameOrigins().length === 0
        ? [
            {
              source:
                '/:path((?:_next/static|_next/image|favicon\\.ico|assets/|robots\\.txt|sitemap\\.xml|world-110m\\.json|google[0-9a-f]+\\.html).*)',
              headers: [{ key: 'X-Frame-Options', value: 'DENY' }],
            },
          ]
        : [];

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
      ...frameHeaderRoutes,
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
};

export default nextConfig;
