import Editor, { useMonaco, OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { themes, ThemeId } from '../utils/themes';
import { useStore } from '../store/useStore';
import { createTypeFetcher } from '../utils/typeFetcher';

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    theme: ThemeId;
}

export const CodeEditor = ({ value, onChange, theme }: CodeEditorProps) => {
    const monaco = useMonaco();
    const { output, matchLines, dependencies } = useStore();
    const editorRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);
    const ataRef = useRef<ReturnType<typeof createTypeFetcher> | null>(null);

    // Initialize ATA (Auto Type Acquisition)
    useEffect(() => {
        if (!ataRef.current) {
            ataRef.current = createTypeFetcher((code, path) => {
                if (monaco) {
                    (monaco.languages.typescript as any).typescriptDefaults.addExtraLib(code, path || '');
                }
            });
        }
    }, [monaco]);

    // Trigger ATA when dependencies change
    useEffect(() => {
        if (ataRef.current && Object.keys(dependencies).length > 0) {
            const source = Object.keys(dependencies).map(pkg => `import * as ${pkg.replace(/[^a-zA-Z]/g, '_')} from '${pkg}';`).join('\n');
            ataRef.current(source);
        }
    }, [dependencies]);

    useEffect(() => {
        if (monaco) {
            // Define all themes
            themes.forEach(t => {
                monaco.editor.defineTheme(t.id, {
                    base: t.monacoTheme as 'vs' | 'vs-dark' | 'hc-black',
                    inherit: true,
                    rules: [],
                    colors: t.monacoColors,
                });
            });

            // Set active theme
            monaco.editor.setTheme(theme);

            // Allow generic imports to prevent "Cannot find module" errors (until ATA fetches them)
            (monaco.languages.typescript as any).typescriptDefaults.setCompilerOptions({
                moduleResolution: (monaco.languages.typescript as any).ModuleResolutionKind.NodeJs,
                target: (monaco.languages.typescript as any).ScriptTarget.ESNext,
                allowNonTsExtensions: true,
            });
        }
    }, [monaco]);

    // Update theme when it changes
    useEffect(() => {
        if (monaco) {
            monaco.editor.setTheme(theme);
        }
    }, [monaco, theme]);

    // Handle Inline Output (Decorations)
    useEffect(() => {
        if (!editorRef.current || !monaco) return;

        const updateDecorations = () => {
            if (!matchLines) {
                decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
                return;
            }

            const newDecorations: any[] = [];
            const logsByLine = new Map<number, string[]>();

            output.forEach(log => {
                if (log.line) {
                    if (!logsByLine.has(log.line)) logsByLine.set(log.line, []);
                    logsByLine.get(log.line)?.push(log.content.trim());
                }
            });

            logsByLine.forEach((logs, line) => {
                const text = logs.join(', ');
                const display = text.length > 50 ? text.substring(0, 50) + '...' : text;

                newDecorations.push({
                    range: new monaco.Range(line, 1, line, 1),
                    options: {
                        after: {
                            content: `  ${display}`,
                            color: '#6b7280',
                            margin: '0 0 0 10px',
                            fontStyle: 'italic',
                            cursorStops: monaco.editor.InjectedTextCursorStops.None
                        }
                    }
                });
            });

            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
        };

        // Debounce updates to avoid freezing editor on heavy output
        const timer = setTimeout(updateDecorations, 100);

        return () => clearTimeout(timer);

    }, [output, matchLines, monaco]);

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    return (
        <Editor
            height="100%"
            defaultLanguage="typescript"
            language="typescript"
            value={value}
            onChange={onChange}
            theme={theme}
            onMount={handleMount}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"Fira Code", monospace',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
            }}
        />
    );
};
