import type { NextConfig } from 'next';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nextConfig: NextConfig = {
  transpilePackages: ['@cic/db', '@cic/sheets', '@cic/auth', '@cic/sync-worker'],
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      { source: '/en', destination: '/?lang=en' },
      { source: '/cn', destination: '/?lang=zh' },
      { source: '/chn', destination: '/?lang=zh' },
      { source: '/zh', destination: '/?lang=zh' },
      { source: '/s/:code/en', destination: '/s/:code?lang=en' },
      { source: '/s/:code/cn', destination: '/s/:code?lang=zh' },
      { source: '/s/:code/chn', destination: '/s/:code?lang=zh' },
      { source: '/s/:code/zh', destination: '/s/:code?lang=zh' },
    ];
  },
};

export default nextConfig;
