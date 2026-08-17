const fs = require('fs');
const path = require('path');

const apiRoot = path.resolve(__dirname, '..');
const distDir = path.join(apiRoot, 'dist');
const nodeModulesDir = path.join(apiRoot, 'node_modules', '@sanchay');
const distNodeModulesDir = path.join(distDir, 'node_modules', '@sanchay');

const packages = [
  { name: 'config', sourceDist: path.join(distDir, 'packages', 'config', 'src') },
  { name: 'types', sourceDist: path.join(distDir, 'packages', 'types', 'src') },
  { name: 'shared', sourceDist: path.join(distDir, 'packages', 'shared', 'src') },
  { name: 'validation', sourceDist: path.join(distDir, 'packages', 'validation', 'src') },
  { name: 'worker-document-processing', sourceDist: path.join(distDir, 'workers', 'document-processing', 'src') },
  { name: 'worker-knowledge-ingestion', sourceDist: path.join(distDir, 'workers', 'knowledge-ingestion', 'src') },
  { name: 'worker-scheduled-jobs', sourceDist: path.join(distDir, 'workers', 'scheduled-jobs', 'src') },
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deployPackage(pkg, targetParentDir) {
  if (!fs.existsSync(pkg.sourceDist)) {
    return;
  }

  const pkgDest = path.join(targetParentDir, pkg.name);

  // If destination is a symlink, remove it so we can create a real physical directory
  try {
    const stat = fs.lstatSync(pkgDest);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(pkgDest);
    }
  } catch {}

  fs.mkdirSync(pkgDest, { recursive: true });
  copyDirRecursive(pkg.sourceDist, pkgDest);

  // Create a clean, self-contained package.json
  const pkgJson = {
    name: `@sanchay/${pkg.name}`,
    version: '0.1.0',
    main: './index.js',
    types: './index.d.ts',
  };
  fs.writeFileSync(path.join(pkgDest, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf8');
}

// Deploy to both apps/api/node_modules/@sanchay and apps/api/dist/node_modules/@sanchay
fs.mkdirSync(nodeModulesDir, { recursive: true });
fs.mkdirSync(distNodeModulesDir, { recursive: true });

for (const pkg of packages) {
  deployPackage(pkg, nodeModulesDir);
  deployPackage(pkg, distNodeModulesDir);
}

console.log('[SANCHAY BUILD] Self-contained @sanchay/* packages successfully prepared for serverless runtime.');
