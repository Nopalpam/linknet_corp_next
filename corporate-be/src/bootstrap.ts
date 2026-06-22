/**
 * Module alias registration — must be required BEFORE any @-prefixed imports.
 *
 * This mirrors the `paths` entries in tsconfig.json and provides runtime
 * resolution for deployments where build-time alias rewriting (tsc-alias /
 * resolve-ts-paths) has not been executed (e.g. Lambda zip packages).
 *
 * When tsc-alias DOES run (standard Docker / CI build), the compiled files
 * already use relative `require()` calls, so module-alias is a harmless no-op
 * for those imports.
 */

import path from 'path';
import './config/env-loader';
import { applyPrismaDatasourceEnv } from './config/db-connection';

applyPrismaDatasourceEnv(process.env, { allowIncomplete: process.env.NODE_ENV !== 'production' });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ma = require('module-alias') as {
  addAliases: (aliases: Record<string, string>) => void;
};

ma.addAliases({
  '@': __dirname,
  '@controllers': path.join(__dirname, 'controllers'),
  '@models': path.join(__dirname, 'models'),
  '@routes': path.join(__dirname, 'routes'),
  '@middleware': path.join(__dirname, 'middleware'),
  '@services': path.join(__dirname, 'services'),
  '@utils': path.join(__dirname, 'utils'),
  '@config': path.join(__dirname, 'config'),
  '@types': path.join(__dirname, 'types'),
});
