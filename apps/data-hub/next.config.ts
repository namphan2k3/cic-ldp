import type { NextConfig } from 'next';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nextConfig: NextConfig = {
  transpilePackages: ['@cic/db', '@cic/sheets', '@cic/auth', '@cic/sync-worker'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
