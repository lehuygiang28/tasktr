const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, relative } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/apps/be'),
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
            assets: ['./src/assets'],
            optimization: false,
            outputHashing: 'none',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './common/src/i18n/lang/**/*.json',
                    to({ context, absoluteFilename }) {
                        const pathWithinLang = relative(
                            join(context, 'common/src/i18n/', 'lang'),
                            absoluteFilename,
                        );
                        return `assets/i18n/lang/${pathWithinLang}`;
                    },
                },
                {
                    from: './common/src/mail/templates/**/*.{hbs,png}',
                    to({ context, absoluteFilename }) {
                        const pathWithinLang = relative(
                            join(context, 'common/src/mail/', 'templates'),
                            absoluteFilename,
                        );
                        return `assets/mail/templates/${pathWithinLang}`;
                    },
                },
            ],
        }),
    ],
};
