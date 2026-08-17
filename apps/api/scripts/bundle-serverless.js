const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildBundle() {
  const apiRoot = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(apiRoot, '../..');
  const distDir = path.join(apiRoot, 'dist');

  console.log('[SANCHAY] Bundling self-contained serverless API with esbuild...');

  // Locate the compiled serverless entrypoint (emitted with full decorator metadata by nest build)
  let entryPoint = path.join(distDir, 'apps/api/src/serverless.js');
  if (!fs.existsSync(entryPoint)) {
    entryPoint = path.join(distDir, 'serverless.js');
  }
  if (!fs.existsSync(entryPoint)) {
    entryPoint = path.join(apiRoot, 'src/serverless.ts');
  }

  console.log(`[SANCHAY] Using entrypoint: ${entryPoint}`);

  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(distDir, 'serverless.bundle.js'),
    packages: 'external',
    plugins: [
      {
        name: 'inline-sanchay-packages',
        setup(build) {
          build.onResolve({ filter: /^@sanchay\// }, (args) => {
            const pkgName = args.path.replace(/^@sanchay\//, '');
            let candidate;
            if (pkgName.startsWith('worker-')) {
              const workerName = pkgName.replace('worker-', '');
              candidate = path.join(repoRoot, 'workers', workerName, 'dist/index.js');
              if (!fs.existsSync(candidate)) {
                candidate = path.join(repoRoot, 'workers', workerName, 'src/index.ts');
              }
            } else {
              candidate = path.join(repoRoot, 'packages', pkgName, 'dist/index.js');
              if (!fs.existsSync(candidate)) {
                candidate = path.join(repoRoot, 'packages', pkgName, 'src/index.ts');
              }
            }
            return { path: candidate };
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
