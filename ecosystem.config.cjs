/**
 * Background dev processes (keeps running after you close the terminal).
 *
 * Setup once:
 *   npm install -g pm2
 *   npm install          (from repo root — installs concurrently)
 *   npm run dev:bg
 *
 * Useful commands:
 *   npm run dev:bg:logs     — tail logs
 *   npm run dev:bg:stop     — pause both
 *   npm run dev:bg:restart  — restart both
 *   npm run dev:bg:delete   — remove from PM2
 */
module.exports = {
  apps: [
    {
      name: 'hireflow-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      autorestart: true,
      watch: false,
    },
    {
      name: 'hireflow-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      autorestart: true,
      watch: false,
    },
  ],
};
