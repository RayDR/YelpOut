module.exports = {
  apps: [
    {
      name: 'yelpout',
      script: 'npm',
      args: 'start',
      cwd: '/forge/yelpout',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3010,
      },
      error_file: '/forge/yelpout/logs/pm2-error.log',
      out_file: '/forge/yelpout/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
