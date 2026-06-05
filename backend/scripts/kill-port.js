/**
 * Kills any process listening on PORT (default 3001) before the server starts.
 * Runs automatically via the "prestart" npm script — no manual intervention needed.
 */
const { execSync } = require('child_process');
const PORT = process.env.PORT || 3001;

try {
  if (process.platform === 'win32') {
    execSync(
      `powershell -Command "` +
      `Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue ` +
      `| Select-Object -ExpandProperty OwningProcess -Unique ` +
      `| Where-Object { $_ -gt 0 } ` +
      `| ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`,
      { stdio: 'pipe' }
    );
  } else {
    execSync(`lsof -ti :${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'pipe' });
  }
} catch {
  // Port was already free — nothing to kill
}
