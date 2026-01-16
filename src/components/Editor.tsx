import Editor, { useMonaco, OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { themes, ThemeId } from '../utils/themes';
import { useStore } from '../store/useStore';
import { createTypeFetcher } from '../utils/typeFetcher';
import prettier from 'prettier/standalone';
import parserTypeScript from 'prettier/parser-typescript';

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    theme: ThemeId;
}

export const CodeEditor = ({ value, onChange, theme }: CodeEditorProps) => {
    const monaco = useMonaco();
    const { output, matchLines, dependencies } = useStore(
        useShallow(state => ({
            output: state.output,
            matchLines: state.matchLines,
            dependencies: state.dependencies
        }))
    );
    const editorRef = useRef<any>(null);
    const decorationsCollectionRef = useRef<any>(null);
    const ataRef = useRef<ReturnType<typeof createTypeFetcher> | null>(null);

    // Initialize ATA (Auto Type Acquisition)
    useEffect(() => {
        if (!ataRef.current) {
            ataRef.current = createTypeFetcher((code, path) => {
                if (monaco) {
                    monaco.typescript.typescriptDefaults.addExtraLib(code, path || '');
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
                    rules: t.rules || [],
                    colors: t.monacoColors,
                });
            });

            // Set active theme
            monaco.editor.setTheme(theme);

            // Allow generic imports to prevent "Cannot find module" errors (until ATA fetches them)
            // Use the new top-level typescript namespace if available, fallback to deprecated path for safety
            const ts = monaco.typescript;

            ts.typescriptDefaults.setCompilerOptions({
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.ESNext,
                allowNonTsExtensions: true,
                allowSyntheticDefaultImports: true,
                moduleDetection: 3, // Force module detection to enable top-level await
                lib: ['esnext', 'dom'],
            });

            // Add Node.js types shim
            monaco.typescript.typescriptDefaults.addExtraLib(
                `
                declare var require: {
                    (id: string): any;
                    resolve(id: string): string;
                    cache: any;
                    extensions: any;
                    main: any;
                };
                declare var module: any;
                declare var process: any;
                declare var global: any;
                declare var console: any;
                declare var __dirname: string;
                declare var __filename: string;
                `,
                'ts:filename/node-shim.d.ts'
            );
        }
    }, [monaco, theme]);

    // Update theme when it changes
    useEffect(() => {
        if (monaco) {
            monaco.editor.setTheme(theme);
        }
    }, [monaco, theme]);

    // Handle Inline Output (Decorations)
    useEffect(() => {
        if (!editorRef.current || !monaco) return;

        // Initialize decorations collection if needed
        if (!decorationsCollectionRef.current) {
            decorationsCollectionRef.current = editorRef.current.createDecorationsCollection();
        }

        const updateDecorations = () => {
            if (!matchLines) {
                decorationsCollectionRef.current.clear();
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

            decorationsCollectionRef.current.set(newDecorations);
        };

        // Debounce updates to avoid freezing editor on heavy output
        const timer = setTimeout(updateDecorations, 100);

        return () => clearTimeout(timer);

    }, [output, matchLines, monaco]);

    const handleMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;

        // Add Format Command (Shift + Alt + F)
        editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF, async () => {
            try {
                const currentCode = editor.getValue();
                const formatted = await prettier.format(currentCode, {
                    parser: 'typescript',
                    plugins: [parserTypeScript],
                    singleQuote: true,
                    tabWidth: 4,
                    printWidth: 100,
                });

                // Push edit to stack so it can be undone
                editor.executeEdits('prettier', [{
                    range: editor.getModel()!.getFullModelRange(),
                    text: formatted,
                    forceMoveMarkers: true
                }]);

                // Trigger change manually as executeEdits might not trigger generic onChange in all setups logic
                // Actually executeEdits DOES trigger content change events which onChange catches.
            } catch (e) {
                console.error('Formatting failed:', e);
            }
        });
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
