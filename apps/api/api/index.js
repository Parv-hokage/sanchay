const path = require('path');
const fs = require('fs');
const Module = require('module');

// Register module alias resolution before loading serverless handler
const candidateRoots = [
  __dirname,
  path.join(__dirname, '..'),
  path.join(__dirname, '../../dist'),
  path.join(__dirname, '../dist'),
  path.join(__dirname, 'dist'),
  process.cwd(),
  path.join(process.cwd(), 'apps/api'),
  path.join(process.cwd(), 'dist'),
  '/var/task',
  '/var/task/apps/api',
];

function findPackageEntry(pkgRelativePath, distRelativePath) {
  for (const root of candidateRoots) {
    if (!root || !fs.existsSync(root)) continue;

    const inDist = path.join(root, 'dist', distRelativePath);
    if (fs.existsSync(inDist)) return inDist;

    const directDist = path.join(root, distRelativePath);
    if (fs.existsSync(directDist)) return directDist;

    const inPkg = path.join(root, pkgRelativePath);
    if (fs.existsSync(inPkg)) return inPkg;
  }
  return null;
}

const aliasMap = {
  '@sanchay/config': findPackageEntry('packages/config/src/index.ts', 'packages/config/src/index.js'),
  '@sanchay/types': findPackageEntry('packages/types/src/index.ts', 'packages/types/src/index.js'),
  '@sanchay/shared': findPackageEntry('packages/shared/src/index.ts', 'packages/shared/src/index.js'),
  '@sanchay/validation': findPackageEntry('packages/validation/src/index.ts', 'packages/validation/src/index.js'),
  '@sanchay/worker-document-processing': findPackageEntry('workers/document-processing/src/index.ts', 'workers/document-processing/src/index.js'),
  '@sanchay/worker-knowledge-ingestion': findPackageEntry('workers/knowledge-ingestion/src/index.ts', 'workers/knowledge-ingestion/src/index.js'),
  '@sanchay/worker-scheduled-jobs': findPackageEntry('workers/scheduled-jobs/src/index.ts', 'workers/scheduled-jobs/src/index.js'),
};

if (!Module.__sanchayAliasesRegistered) {
  Module.__sanchayAliasesRegistered = true;
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    if (aliasMap[request]) {
      return aliasMap[request];
    }
    for (const [alias, resolved] of Object.entries(aliasMap)) {
      if (resolved && request.startsWith(`${alias}/`)) {
        const subpath = request.slice(alias.length + 1);
        const resolvedDir = path.dirname(resolved);
        const candidate = path.join(resolvedDir, `${subpath}.js`);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };
}

let serverlessHandler;

function findServerless(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findServerless(fullPath);
        if (found) return found;
      } else if (entry.name === 'serverless.js') {
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

