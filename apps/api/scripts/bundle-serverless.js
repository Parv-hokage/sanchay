const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildBundle() {
  const apiRoot = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(apiRoot, '../..');
  const distDir = path.join(apiRoot, 'dist');

  console.log('[SANCHAY] Bundling self-contained serverless API with esbuild...');

  // 1. Bundle serverless entrypoint directly from TypeScript
  await esbuild.build({
    entryPoints: [path.join(apiRoot, 'src/serverless.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(distDir, 'serverless.bundle.js'),
    tsconfig: path.join(apiRoot, 'tsconfig.json'),
    packages: 'external',
    plugins: [
      {
        name: 'inline-sanchay-packages',
        setup(build) {
          build.onResolve({ filter: /^@sanchay\// }, (args) => {
            const pkgName = args.path.replace(/^@sanchay\//, '');
            if (pkgName.startsWith('worker-')) {
              const workerName = pkgName.replace('worker-', '');
              return { path: path.join(repoRoot, 'workers', workerName, 'src/index.ts') };
            }
            return { path: path.join(repoRoot, 'packages', pkgName, 'src/index.ts') };
          });
        },
      },
    ],
    sourcemap: true,
    treeShaking: true,
    logLevel: 'info',
  });

  console.log('[SANCHAY] Self-contained bundle created at apps/api/dist/serverless.bundle.js');
}

buildBundle().catch((err) => {
  console.error('[SANCHAY] Bundle failed:', err);
  process.exit(1);
});
