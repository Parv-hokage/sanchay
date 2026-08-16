let serverlessHandler;

function getHandler() {
  if (!serverlessHandler) {
    const candidatePaths = [
      '../dist/apps/api/src/serverless',
      '../dist/src/serverless',
      '../dist/serverless',
    ];

    for (const p of candidatePaths) {
      try {
        const mod = require(p);
        serverlessHandler = mod.default || mod;
        if (serverlessHandler) break;
      } catch {
        // try next candidate
      }
    }

    if (!serverlessHandler) {
      throw new Error(
        'Unable to locate NestJS serverless handler in dist. Candidate paths: ' +
          candidatePaths.join(', '),
      );
    }
  }
  return serverlessHandler;
}

module.exports = async (req, res) => {
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
  return handler(req, res);
};
