const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildBundle() {
  const apiRoot = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(apiRoot, '../..');
  const distDir = path.join(apiRoot, 'dist');

  console.log('[SANCHAY] Bundling self-contained serverless API with esbuild...');

  // Locate the compiled serverless entrypoint (emitted with full decorator metadata by nest build)
  let entryPoint = path.join(distDir, 'serverless.js');
  if (!fs.existsSync(entryPoint)) {
    entryPoint = path.join(distDir, 'apps/api/src/serverless.js');
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
        name: 'inline-sanchay-monorepo-modules',
        setup(build) {
          // Resolve @sanchay/* package imports to their dist or src index
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

          // Intercept any relative imports pointing to packages/ or workers/
          build.onResolve({ filter: /packages\/([a-z0-9-]+)/ }, (args) => {
            const match = args.path.match(/packages\/([a-z0-9-]+)/);
            if (match) {
              const pkgName = match[1];
              let candidate = path.join(repoRoot, 'packages', pkgName, 'dist/index.js');
              if (!fs.existsSync(candidate)) {
                candidate = path.join(repoRoot, 'packages', pkgName, 'src/index.ts');
              }
              return { path: candidate };
            }
          });

          build.onResolve({ filter: /workers\/([a-z0-9-]+)/ }, (args) => {
            const match = args.path.match(/workers\/([a-z0-9-]+)/);
            if (match) {
              const workerName = match[1];
              let candidate = path.join(repoRoot, 'workers', workerName, 'dist/index.js');
              if (!fs.existsSync(candidate)) {
                candidate = path.join(repoRoot, 'workers', workerName, 'src/index.ts');
              }
              return { path: candidate };
            }
          });
        },
      },
    ],
    sourcemap: true,
    treeShaking: true,
    logLevel: 'info',
  });

  const bundlePath = path.join(distDir, 'serverless.bundle.js');
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`Bundle file not generated at ${bundlePath}`);
  }

  const bundleContent = fs.readFileSync(bundlePath, 'utf8');
  console.log(`[SANCHAY] Bundle successfully created (${Math.round(bundleContent.length / 1024)} KB)`);

  // Verification checks
  const unresolvedMatches = bundleContent.match(/require\(["']@sanchay\/[^"']+["']\)/g);
  if (unresolvedMatches) {
    throw new Error(`Bundle contains unresolved @sanchay imports: ${unresolvedMatches.join(', ')}`);
  }

  const sourcePathMatches = bundleContent.match(/require\(["'][^"']*\.\.\/(?:packages|workers)\/[^"']+["']\)/g);
  if (sourcePathMatches) {
    throw new Error(`Bundle contains relative monorepo require paths: ${sourcePathMatches.join(', ')}`);
  }

  console.log('[SANCHAY] Bundle invariant verification: PASS (0 unresolved @sanchay, 0 source path requires)');
}

buildBundle().catch((err) => {
  console.error('[SANCHAY] Bundle failed:', err);
  process.exit(1);
});
