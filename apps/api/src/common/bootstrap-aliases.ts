import path from 'path';
import fs from 'fs';
import Module from 'module';

export function registerModuleAliases(): void {
  const nodeModule = Module as any;
  if (nodeModule.__sanchayAliasesRegistered) {
    return;
  }
  nodeModule.__sanchayAliasesRegistered = true;

  const originalResolveFilename = nodeModule._resolveFilename;

  const candidateRoots = [
    __dirname,
    path.join(__dirname, '..'),
    path.join(__dirname, '../..'),
    path.join(__dirname, '../../..'),
    process.cwd(),
    path.join(process.cwd(), 'apps/api'),
    path.join(process.cwd(), 'dist'),
    '/var/task',
    '/var/task/apps/api',
  ];

  function findPackageEntry(pkgRelativePath: string, distRelativePath: string): string | null {
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

  const aliasMap: Record<string, string | null> = {
    '@sanchay/config': findPackageEntry('packages/config/src/index.ts', 'packages/config/src/index.js'),
    '@sanchay/types': findPackageEntry('packages/types/src/index.ts', 'packages/types/src/index.js'),
    '@sanchay/shared': findPackageEntry('packages/shared/src/index.ts', 'packages/shared/src/index.js'),
    '@sanchay/validation': findPackageEntry('packages/validation/src/index.ts', 'packages/validation/src/index.js'),
    '@sanchay/worker-document-processing': findPackageEntry('workers/document-processing/src/index.ts', 'workers/document-processing/src/index.js'),
    '@sanchay/worker-knowledge-ingestion': findPackageEntry('workers/knowledge-ingestion/src/index.ts', 'workers/knowledge-ingestion/src/index.js'),
    '@sanchay/worker-scheduled-jobs': findPackageEntry('workers/scheduled-jobs/src/index.ts', 'workers/scheduled-jobs/src/index.js'),
  };

  nodeModule._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
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

registerModuleAliases();
