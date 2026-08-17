const path = require('path');
let serverlessHandler;

function getHandler() {
  if (!serverlessHandler) {
    const candidatePaths = [
      path.join(__dirname, '../apps/api/dist/apps/api/src/serverless'),
      path.join(__dirname, '../apps/api/dist/src/serverless'),
      path.join(__dirname, '../apps/api/dist/serverless'),
      path.join(__dirname, '../dist/apps/api/src/serverless'),
      path.join(__dirname, '../dist/src/serverless'),
      path.join(__dirname, '../dist/serverless'),
      path.join(process.cwd(), 'apps/api/dist/apps/api/src/serverless'),
      path.join(process.cwd(), 'apps/api/dist/src/serverless'),
      path.join(process.cwd(), 'apps/api/dist/serverless'),
      path.join(process.cwd(), 'dist/apps/api/src/serverless'),
      path.join(process.cwd(), 'dist/src/serverless'),
      path.join(process.cwd(), 'dist/serverless'),
      '../apps/api/dist/apps/api/src/serverless',
      '../apps/api/dist/src/serverless',
      '../apps/api/dist/serverless',
      '../dist/apps/api/src/serverless',
      '../dist/src/serverless',
      '../dist/serverless',
    ];

    const errors = [];
    for (const p of candidatePaths) {
      try {
        const mod = require(p);
        serverlessHandler = mod.default || mod;
        if (serverlessHandler) break;
      } catch (err) {
        errors.push(`${p} -> ${err.message}`);
      }
    }

    if (!serverlessHandler) {
      throw new Error(
        'Unable to locate NestJS serverless handler in dist. Attempted:\n' +
          errors.join('\n'),
      );
    }
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

