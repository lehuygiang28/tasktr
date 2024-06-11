/**
 * Config for using path-aliases
 */

const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = '../';
const cleanup = tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.baseUrl || baseUrl,
    paths: tsConfig.compilerOptions.paths,
    cwd: './tsconfig.json',
});

require('../apps/be/src/main');

// When path registration is no longer needed
cleanup();
