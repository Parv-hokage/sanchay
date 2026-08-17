const path = require('path');
const fs = require('fs');

let serverlessHandler;

function findServerless(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  try {
    const directBundle = path.join(dir, 'serverless.bundle.js');
    if (fs.existsSync(directBundle)) return directBundle;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findServerless(fullPath);
        if (found) return found;
      } else if (entry.name === 'serverless.bundle.js') {
        return fullPath;
      }
    }

    const directJs = path.join(dir, 'serverless.js');
    if (fs.existsSync(directJs)) return directJs;

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === 'serverless.js') {
        return fullPath;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function getHandler() {
  if (!serverlessHandler) {
    const searchDirs = [
      path.join(__dirname, '../dist'),
      path.join(__dirname, '../../dist'),
      path.join(__dirname, 'dist'),
      path.join(process.cwd(), 'dist'),
      path.join(process.cwd(), 'apps/api/dist'),
      '/var/task/dist',
      '/var/task/apps/api/dist',
      path.join(__dirname, '..'),
      process.cwd(),
    ];

    let targetFile = null;
    for (const d of searchDirs) {
      targetFile = findServerless(d);
      if (targetFile) break;
    }

    if (!targetFile) {
      const cwdList = fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : [];
      const dirList = fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : [];
      throw new Error(
        `Unable to find serverless.js. cwd: ${process.cwd()} [${cwdList.join(', ')}], __dirname: ${__dirname} [${dirList.join(', ')}]`,
      );
    }

    const mod = require(targetFile);
    serverlessHandler = mod.default || mod;
  }
  return serverlessHandler;
}

module.exports = async (req, res) => {
  try {
    if (req.url) {
      if (req.url.startsWith('/api?match=')) {
        const match = req.url.substring('/api?match='.length);
        req.url = `/api/v1/${decodeURIComponent(match)}`;
      } else if (req.url === '/api' || req.url.startsWith('/api?')) {
        const match = req.query?.match;
        if (match) {
          const matchPath = Array.isArray(match) ? match.join('/') : match;
          req.url = `/api/v1/${matchPath}`;
        }
      }
    }

    const handler = getHandler();
    return await handler(req, res);
  } catch (err) {
    console.error('Serverless execution error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: {
          code: 'SERVERLESS_ERROR',
          message: err.message,
          stack: err.stack,
        },
      }),
    );
  }
};

