/**
 * Config for using path-aliases
 */

const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = '../';

tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.baseUrl || baseUrl,
    paths: tsConfig.compilerOptions.paths,
    cwd: './tsconfig.json',
});

require('../apps/be/src/main');
