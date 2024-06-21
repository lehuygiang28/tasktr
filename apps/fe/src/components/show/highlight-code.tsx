'use client';

import { useContext, useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { Highlight, themes } from 'prism-react-renderer';
import { format } from 'prettier';
import * as prettierBabel from 'prettier/plugins/babel';
import * as prettierMd from 'prettier/plugins/markdown';
import * as prettierEstree from 'prettier/plugins/estree';
import * as prettierHtml from 'prettier/plugins/html';

import { ColorModeContext } from '~/contexts/color-mode';

export type HighlightCodeProps = {
    source: string;
    formatType: 'json' | 'markdown' | 'html';
};

export function HighlightCode({ source = '', formatType }: HighlightCodeProps) {
    const { mode } = useContext(ColorModeContext);
    const [formattedSource, setFormattedSource] = useState<string>('');
    const [isFormatting, setIsFormatting] = useState(false);

    useEffect(() => {
        const formatSource = async () => {
            setIsFormatting(true);
            switch (formatType) {
                case 'json': {
                    const formatted = await format(source, {
                        plugins: [prettierEstree, prettierBabel],
                        parser: 'json-stringify',
                    });
                    setFormattedSource(formatted?.trim());
                    break;
                }
                case 'html': {
                    const formatted = await format(source, {
                        plugins: [prettierEstree, prettierHtml],
                        parser: 'html',
                    });
                    setFormattedSource(formatted?.trim());
                    break;
                }
                case 'markdown':
                default: {
                    const formatted = await format(source, {
                        plugins: [prettierEstree, prettierMd],
                        parser: 'markdown',
                    });
                    setFormattedSource(formatted?.trim());
                    break;
                }
            }
            setIsFormatting(false);
        };

        formatSource();
    }, [source, formatType]);

    return isFormatting ? (
        <Skeleton style={{ width: '100%' }} active />
    ) : (
        <Highlight
            theme={mode === 'light' ? themes.duotoneLight : themes.vsDark}
            code={formattedSource?.trim() === '' ? '// empty' : formattedSource}
            language="ts"
        >
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre style={{ ...style, whiteSpace: 'pre-wrap' }}>
                    {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    );
}
