module.exports = {
  apps: [
    {
      name: 'amazonia-api',
      cwd: './api-rest-amazonia',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '600M',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      error_file: './logs/amazonia-api-error.log',
      out_file: './logs/amazonia-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'georef-service',
      cwd: './georef-service',
      // gunicorn binary is inside the venv; interpreter: 'none' tells PM2
      // to call the script directly without wrapping it in node/python.
      script: 'venv/bin/gunicorn',
      args: 'app.main:app -c gunicorn.conf.py',
      interpreter: 'none',
      watch: false,
      max_memory_restart: '2G',
      env_production: {
        ENVIRONMENT: 'production',
      },
      env_development: {
        ENVIRONMENT: 'development',
      },
      error_file: './logs/georef-error.log',
      out_file: './logs/georef-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
