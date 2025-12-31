export type ThemeId = 'runts-dark' | 'dracula' | 'light' | 'monokai' | 'nord' | 'solarized-dark' | 'github-light';

export interface ThemeColors {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentTraffic: string;
}

export interface Theme {
    id: ThemeId;
    name: string;
    colors: ThemeColors;
    monacoTheme: string;
    monacoColors: {
        'editor.background': string;
        'editor.foreground': string;
        [key: string]: string;
    };
    rules?: { token: string; foreground: string; fontStyle?: string }[];
}

export const themes: Theme[] = [
    {
        id: 'runts-dark',
        name: 'RunTS Dark',
        colors: {
            bgPrimary: '#09090b', // Zinc 950
            bgSecondary: '#18181b', // Zinc 900
            textPrimary: '#f4f4f5', // Zinc 100
            textSecondary: '#a1a1aa', // Zinc 400
            border: '#27272a', // Zinc 800
            accent: '#3b82f6', // Blue 500
            accentTraffic: '#22c55e' // Green 500
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#09090b',
            'editor.foreground': '#f4f4f5',
            'editor.lineHighlightBackground': '#18181b',
            'editorLineNumber.foreground': '#52525b',
            'editorIndentGuide.background': '#27272a',
            'editor.selectionBackground': '#3b82f620',
        },
        rules: [
            { token: 'comment', foreground: '52525b', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'c084fc' }, // Violet
            { token: 'string', foreground: '86efac' }, // Green
            { token: 'number', foreground: 'fcd34d' }, // Amber
            { token: 'type', foreground: '93c5fd' }, // Blue
            { token: 'class', foreground: '93c5fd' },
            { token: 'function', foreground: '67e8f9' }, // Cyan
            { token: 'variable', foreground: 'f4f4f5' },
        ]
    },
    {
        id: 'dracula',
        name: 'Dracula',
        colors: {
            bgPrimary: '#282a36',
            bgSecondary: '#44475a',
            textPrimary: '#f8f8f2',
            textSecondary: '#bd93f9',
            border: '#6272a4',
            accent: '#bd93f9',
            accentTraffic: '#50fa7b'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'editor.selectionBackground': '#44475a',
            'editor.lineHighlightBackground': '#44475a',
            'editorCursor.foreground': '#f8f8f0',
            'editorWhitespace.foreground': '#3B3A32',
        },
        rules: [
            { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'type', foreground: '8be9fd' },
            { token: 'class', foreground: '8be9fd' },
            { token: 'function', foreground: '50fa7b' },
            { token: 'variable', foreground: 'f8f8f2' },
            { token: 'operator', foreground: 'ff79c6' },
        ]
    },
    {
        id: 'monokai',
        name: 'Monokai',
        colors: {
            bgPrimary: '#272822',
            bgSecondary: '#3e3d32',
            textPrimary: '#f8f8f2',
            textSecondary: '#75715e',
            border: '#75715e',
            accent: '#fd971f',
            accentTraffic: '#a6e22e'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2',
            'editor.selectionBackground': '#49483E',
            'editor.lineHighlightBackground': '#3E3D32',
            'editorCursor.foreground': '#f8f8f0',
            'editorWhitespace.foreground': '#3B3A32',
        },
        rules: [
            { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'number', foreground: 'ae81ff' },
            { token: 'keyword', foreground: 'f92672' },
            { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
            { token: 'class', foreground: 'a6e22e' },
            { token: 'function', foreground: 'a6e22e' },
            { token: 'variable', foreground: 'f8f8f2' },
            { token: 'variable.predefined', foreground: 'efc143' }
        ]
    },
    {
        id: 'nord',
        name: 'Nord',
        colors: {
            bgPrimary: '#2e3440',
            bgSecondary: '#3b4252',
            textPrimary: '#d8dee9',
            textSecondary: '#4c566a',
            border: '#434c5e',
            accent: '#88c0d0',
            accentTraffic: '#a3be8c'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#2e3440',
            'editor.foreground': '#d8dee9',
            'editor.selectionBackground': '#434c5e',
            'editor.lineHighlightBackground': '#3b4252',
            'editorCursor.foreground': '#d8dee9',
            'editorWhitespace.foreground': '#434c5e',
        },
        rules: [
            { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
            { token: 'string', foreground: 'a3be8c' },
            { token: 'number', foreground: 'b48ead' },
            { token: 'keyword', foreground: '81a1c1' },
            { token: 'type', foreground: '8fbcbb' },
            { token: 'class', foreground: '8fbcbb' },
            { token: 'function', foreground: '88c0d0' },
            { token: 'variable', foreground: 'd8dee9' },
            { token: 'operator', foreground: '81a1c1' }
        ]
    },
    {
        id: 'solarized-dark',
        name: 'Solarized',
        colors: {
            bgPrimary: '#002b36',
            bgSecondary: '#073642',
            textPrimary: '#839496',
            textSecondary: '#586e75',
            border: '#586e75',
            accent: '#2aa198',
            accentTraffic: '#859900'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#002b36',
            'editor.foreground': '#839496',
            'editor.selectionBackground': '#073642',
            'editor.lineHighlightBackground': '#073642',
            'editorCursor.foreground': '#839496',
            'editorWhitespace.foreground': '#586e75',
        },
        rules: [
            { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
            { token: 'string', foreground: '2aa198' },
            { token: 'number', foreground: 'd33682' },
            { token: 'keyword', foreground: '859900' },
            { token: 'type', foreground: 'b58900' },
            { token: 'class', foreground: 'b58900' },
            { token: 'function', foreground: '268bd2' },
            { token: 'variable', foreground: '839496' },
            { token: 'operator', foreground: '859900' }
        ]
    },
    {
        id: 'github-light',
        name: 'GitHub',
        colors: {
            bgPrimary: '#ffffff',
            bgSecondary: '#f6f8fa',
            textPrimary: '#24292f',
            textSecondary: '#57606a',
            border: '#d0d7de',
            accent: '#0969da',
            accentTraffic: '#2da44e'
        },
        monacoTheme: 'vs',
        monacoColors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#24292f',
            'editor.selectionBackground': '#BBDFFF',
            'editor.lineHighlightBackground': '#f6f8fa',
            'editorCursor.foreground': '#24292f',
            'editorWhitespace.foreground': '#d0d7de',
        },
        rules: [
            { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
            { token: 'string', foreground: '0a3069' },
            { token: 'number', foreground: '0550ae' },
            { token: 'keyword', foreground: 'cf222e' },
            { token: 'type', foreground: '953800' },
            { token: 'class', foreground: '953800' },
            { token: 'function', foreground: '8250df' },
            { token: 'variable', foreground: '24292f' },
            { token: 'operator', foreground: 'cf222e' }
        ]
    },
    {
        id: 'light',
        name: 'Light',
        colors: {
            bgPrimary: '#f4f4f5',
            bgSecondary: '#ffffff',
            textPrimary: '#18181b',
            textSecondary: '#71717a',
            border: '#e4e4e7',
            accent: '#3b82f6',
            accentTraffic: '#22c55e'
        },
        monacoTheme: 'vs',
        monacoColors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#18181b',
            'editor.selectionBackground': '#bfdbfe',
            'editor.lineHighlightBackground': '#f4f4f5',
        },
        rules: [] // Default VS light highlighting
    }
];
