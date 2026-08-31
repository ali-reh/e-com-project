const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Find all .ts files in public/scripts and public/admin-x7k9m2/scripts
const mainScriptDir = path.join(__dirname, 'public/scripts');
const adminScriptDir = path.join(__dirname, 'public/admin-x7k9m2/scripts');

const files = [
  ...fs.readdirSync(mainScriptDir).filter(f => f.endsWith('.ts')).map(f => path.join(mainScriptDir, f)),
  ...fs.readdirSync(adminScriptDir).filter(f => f.endsWith('.ts')).map(f => path.join(adminScriptDir, f)),
];

esbuild.buildSync({
  entryPoints: files,
  outdir: path.join(__dirname, 'public/dist'),
  format: 'esm',
  bundle: false,
  minify: true,
  sourcemap: false,
  tsconfig: path.join(__dirname, 'tsconfig.frontend.json'),
});

console.log(`✅ Built ${files.length} frontend scripts`);
