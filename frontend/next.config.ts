import type { NextConfig } from "next";
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const defaultRemoteImageHosts = [
  'linknet.co.id',
  'www.linknet.co.id',
  'api.linknet.co.id',
  '*.cloudfront.net',
  '*.amazonaws.com',
  '*.blob.core.windows.net',
];
const configuredRemoteImageHosts = (process.env.NEXT_IMAGE_REMOTE_HOSTS || defaultRemoteImageHosts.join(','))
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)
  .map((host) => (host.startsWith('*.') ? `**.${host.slice(2)}` : host));
const remoteImagePatterns = configuredRemoteImageHosts.map((hostname) => ({
  protocol: 'https' as const,
  hostname,
}));

if (isProduction && process.env.NEXT_PUBLIC_AUTH_ENABLED === 'false') {
  throw new Error('NEXT_PUBLIC_AUTH_ENABLED=false is not allowed for production builds');
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${isProduction ? '' : ' http:'}`,
  "font-src 'self' data:",
  `connect-src 'self' https:${isProduction ? '' : ' http:'}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      ...remoteImagePatterns,
      ...(isProduction ? [] : [{
        protocol: 'http',
        hostname: '**',
      } as const]),
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
        ],
      },
    ];
  },
    
    turbopack: {
      root: repoRoot,
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  
};

export default nextConfig;
