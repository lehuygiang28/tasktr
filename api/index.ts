/**
 * Config for using path-aliases
 */

const path = require('path');
const moduleAlias = require('module-alias');
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = tsConfig?.compilerOptions?.baseUrl ?? '../';

// Register tsconfig-paths, use for TS
tsConfigPaths.register({
    baseUrl: baseUrl,
    paths: tsConfig.compilerOptions.paths,
    cwd: __dirname,
});

// Config for serverless can understand alias
if (tsConfig?.compilerOptions?.paths) {
    for (const alias in tsConfig.compilerOptions.paths) {
        const paths = tsConfig.compilerOptions.paths[alias];
        if (paths) {
            let targetPath = paths[0];
            targetPath = targetPath.replace(/(\/\*|\*|\\*)$/g, '');
            const formattedAlias = alias.replace(/(\/\*|\*|\\*)$/g, '');
            moduleAlias.addAlias(formattedAlias, path.resolve(__dirname, baseUrl, targetPath));
        }
    }
}

/**
 * Require the needed modules, that serverless can compile it to JS
 * Then the server can be import and run it
 */
require('../apps/be/common/src/index');
require('../apps/be/src/app/index');

/**
 * Main file to run the server
 */
require('../apps/be/src/main');
