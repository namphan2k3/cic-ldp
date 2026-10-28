module.exports = {
  apps: [
    {
      name: 'robotcongtrinh',
      cwd: './apps/landing-hub',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p ' + (process.env.PORT || 3000),
      env: {
        NODE_ENV: 'production',
        DEFAULT_SITE_CODE: 'robot-cong-trinh',
      },
    },
  ],
};
