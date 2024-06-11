/**
 * Config for using path-aliases
 */

const path = require('path');
const moduleAlias = require('module-alias');
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = '../';

tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.baseUrl || baseUrl,
    paths: tsConfig.compilerOptions.paths,
    cwd: __dirname,
});

if (tsConfig?.compilerOptions?.paths) {
    for (const alias in tsConfig.compilerOptions.paths) {
        const paths = tsConfig.compilerOptions.paths[alias];
        if (paths) {
            const targetPath = paths[0];
            const formattedAlias = alias.replace(/(\/\*|\*|\\*)$/g, '');
        }
    }
}

require('../apps/be/src/main');
