export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'LinkNet Corp',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  },
} as const;

export default config;
