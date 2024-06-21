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
    formatType: 'json' | 'markdown' | 'html' | 'xml' | 'auto';
};

export function HighlightCode({ source = '', formatType }: HighlightCodeProps) {
    const { mode } = useContext(ColorModeContext);
    const [formattedSource, setFormattedSource] = useState<string>('');
    const [isFormatting, setIsFormatting] = useState(false);
    const [language, setLanguage] = useState<HighlightCodeProps['formatType']>(formatType);

    useEffect(() => {
        const formatSource = async () => {
            setIsFormatting(true);
            const trimmedSource = source?.trim();
            try {
                switch (language) {
                    case 'auto': {
                        if (/<!DOCTYPE html>/i.test(source)) {
                            setLanguage('html');
                        } else if (/^<\?xml/i.test(source)) {
                            setLanguage('xml');
                        } else if (/^\s*\{/.test(source)) {
                            setLanguage('json');
                        } else {
                            // Fallback to markdown
                            throw new Error('Non-auto language detected. Fallback to markdown.');
                        }
                        break;
                    }
                    case 'json': {
                        const formatted = await format(trimmedSource, {
                            plugins: [prettierEstree, prettierBabel],
                            parser: 'json-stringify',
                        });
                        setFormattedSource(formatted?.trim());
                        break;
                    }
                    case 'html': {
                        const formatted = await format(trimmedSource, {
                            plugins: [prettierEstree, prettierHtml],
                            parser: 'html',
                        });
                        setFormattedSource(formatted?.trim());
                        break;
                    }
                    case 'xml': {
                        const formatted = await format(trimmedSource, {
                            plugins: [prettierEstree, prettierHtml],
                            parser: 'xml',
                        });
                        setFormattedSource(formatted?.trim());
                        break;
                    }
                    case 'markdown':
                    default: {
                        const formatted = await format(trimmedSource, {
                            plugins: [prettierEstree, prettierMd],
                            parser: 'markdown',
                        });
                        setFormattedSource(formatted?.trim());
                        break;
                    }
                }
            } catch {
                setLanguage('markdown');
            }

            setIsFormatting(false);
        };

        formatSource();
    }, [source, language]);

    return isFormatting ? (
        <Skeleton style={{ width: '100%' }} active />
    ) : (
        <Highlight
            theme={mode === 'light' ? themes.duotoneLight : themes.vsDark}
            code={formattedSource}
            language={language}
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
