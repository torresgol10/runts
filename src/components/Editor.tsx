import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { themes, ThemeId } from '../utils/themes';

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    theme: ThemeId;
}

export const CodeEditor = ({ value, onChange, theme }: CodeEditorProps) => {
    const monaco = useMonaco();

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

            // Allow generic imports to prevent "Cannot find module" errors
            // @ts-ignore
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                // @ts-ignore
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                // @ts-ignore
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true,
            });

            // @ts-ignore
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `declare module '*'`,
                'global.d.ts'
            );
        }
    }, [monaco]);

    // Update theme when it changes
    useEffect(() => {
        if (monaco) {
            monaco.editor.setTheme(theme);
        }
    }, [monaco, theme]);

    return (
        <Editor
            height="100%"
            defaultLanguage="typescript"
            language="typescript"
            value={value}
            onChange={onChange}
            theme={theme}
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
