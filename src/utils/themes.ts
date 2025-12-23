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
    };
}

export const themes: Theme[] = [
    {
        id: 'runts-dark',
        name: 'RunTS Dark',
        colors: {
            bgPrimary: '#0f0f11',
            bgSecondary: '#1d1d21',
            textPrimary: '#e4e4e7',
            textSecondary: '#a1a1aa',
            border: '#27272a',
            accent: '#3178C6',
            accentTraffic: '#16a34a'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#0f0f11',
            'editor.foreground': '#e4e4e7',
        }
    },
    {
        id: 'dracula',
        name: 'Dracula',
        colors: {
            bgPrimary: '#282a36',
            bgSecondary: '#44475a',
            textPrimary: '#f8f8f2',
            textSecondary: '#bfbfbf',
            border: '#6272a4',
            accent: '#bd93f9',
            accentTraffic: '#50fa7b'
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
        }
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
        }
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
        }
    },
    {
        id: 'solarized-dark',
        name: 'Solarized Dark',
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
        }
    },
    {
        id: 'github-light',
        name: 'GitHub Light',
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
        }
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
        }
    }
];
