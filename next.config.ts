import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // 'unsafe-inline' kept for Next.js inline scripts & CSS-in-JS.
  // TODO: migrate to nonce-based CSP to eliminate 'unsafe-inline' entirely.
  // 'unsafe-eval' required in dev for webpack HMR; stripped in production builds.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "media-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "manifest-src 'self'",
  // Only upgrade insecure requests in production — dev server is HTTP-only.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
      {
        // Enforce CSP in production; report-only in dev so the dev server works.
        key: isDev ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
        value: cspDirectives,
      },
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
        // ONLY block Teams page from search indexing
        source: '/teams/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
          },
        ],
      },
      {
        // ONLY block About page from search indexing (if it contains executive info)
        source: '/about/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
          },
        ],
      },
      {
        // Sensitive contact route should not be indexed
        source: '/contact/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
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
