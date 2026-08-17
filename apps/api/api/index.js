const path = require('path');
const fs = require('fs');

let serverlessHandler;

function getHandler() {
  if (!serverlessHandler) {
    const searchFiles = [
      path.join(__dirname, '../dist/serverless.bundle.js'),
      path.join(__dirname, 'dist/serverless.bundle.js'),
      path.join(process.cwd(), 'dist/serverless.bundle.js'),
      path.join(process.cwd(), 'apps/api/dist/serverless.bundle.js'),
      '/var/task/dist/serverless.bundle.js',
      '/var/task/apps/api/dist/serverless.bundle.js',
      path.join(__dirname, '../dist/apps/api/src/serverless.js'),
      path.join(__dirname, '../dist/serverless.js'),
    ];

    let targetFile = searchFiles.find((f) => fs.existsSync(f));

    if (!targetFile) {
      const cwdList = fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : [];
      const dirList = fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : [];
      throw new Error(
        `Unable to find serverless bundle. cwd: ${process.cwd()} [${cwdList.join(', ')}], __dirname: ${__dirname} [${dirList.join(', ')}]`,
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
