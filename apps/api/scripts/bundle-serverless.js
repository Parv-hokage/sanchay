const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildBundle() {
  const apiRoot = path.resolve(__dirname, '..');
  const distDir = path.join(apiRoot, 'dist');

  console.log('[SANCHAY] Bundling self-contained serverless API with esbuild...');

  // Use compiled dist/serverless.js entrypoint so TypeScript decorators and metadata are fully preserved
  const entryPoint = path.join(distDir, 'serverless.js');

  console.log(`[SANCHAY] Using entrypoint: ${entryPoint}`);

  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(distDir, 'serverless.bundle.js'),
    packages: 'external',
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
