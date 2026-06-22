const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

function stripJsonComments(input) {
  let output = '';
  let inString = false;
  let quote = '';
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      output += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function walkFiles(dir, extensions) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, extensions));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function toRuntimeSpecifier(fromFile, targetPath) {
  let relativePath = toPosixPath(path.relative(path.dirname(fromFile), targetPath));
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
}

function createMappings(tsconfig, distDir) {
  const compilerOptions = tsconfig.compilerOptions || {};
  const paths = compilerOptions.paths || {};
  const rootDir = path.resolve(projectRoot, compilerOptions.rootDir || 'src');

  return Object.entries(paths)
    .map(([aliasPattern, targets]) => {
      const targetPattern = Array.isArray(targets) ? targets[0] : targets;
      if (!targetPattern) return null;

      const aliasPrefix = aliasPattern.replace(/\*$/, '');
      const targetPrefix = targetPattern.replace(/\*$/, '');
      const targetSourcePath = path.resolve(projectRoot, targetPrefix);
      const relativeToRootDir = path.relative(rootDir, targetSourcePath);
      const targetDistPath = path.resolve(distDir, relativeToRootDir);

      return { aliasPrefix, targetDistPath };
    })
    .filter(Boolean)
    .sort((a, b) => b.aliasPrefix.length - a.aliasPrefix.length);
}

function resolveAlias(specifier, mappings, fromFile) {
  const mapping = mappings.find(({ aliasPrefix }) => specifier.startsWith(aliasPrefix));
  if (!mapping) return specifier;

  const suffix = specifier.slice(mapping.aliasPrefix.length);
  const targetPath = path.join(mapping.targetDistPath, suffix);
  return toRuntimeSpecifier(fromFile, targetPath);
}

const tsconfig = JSON.parse(stripJsonComments(fs.readFileSync(tsconfigPath, 'utf8')));
const outDir = tsconfig.compilerOptions && tsconfig.compilerOptions.outDir
  ? tsconfig.compilerOptions.outDir
  : 'dist';
const distDir = path.resolve(projectRoot, outDir);

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output directory not found: ${distDir}`);
}

const mappings = createMappings(tsconfig, distDir);
const specifierPattern = /(\bfrom\s*["']|\brequire\(\s*["']|\bimport\(\s*["'])(@(?:\/|[A-Za-z0-9_-]+\/)[^"']+)(["']\s*\)?)/g;
let changedFiles = 0;

for (const file of walkFiles(distDir, ['.js', '.d.ts'])) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(specifierPattern, (match, prefix, specifier, suffix) => {
    const resolved = resolveAlias(specifier, mappings, file);
    return `${prefix}${resolved}${suffix}`;
  });

  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changedFiles += 1;
  }
}

console.log(`Resolved TypeScript path aliases in ${changedFiles} compiled file(s).`);
