export type ThemeId = 'runts-dark' | 'dracula' | 'light' | 'monokai';

export interface ThemeColors {
    bgPrimary: string;   // Sidebar, Console bg
    bgSecondary: string; // Editor bg, Panels
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentTraffic: string; // For run button, etc
}

export interface Theme {
    id: ThemeId;
    name: string;
    colors: ThemeColors;
    monacoTheme: string; // Base monaco theme to extend ('vs-dark' or 'vs')
    monacoColors: {
        'editor.background': string;
        'editor.foreground': string;
        // Add more specific monaco overrides if needed
    };
}

export const themes: Theme[] = [
    {
        id: 'runts-dark',
        name: 'RunTS Dark',
        colors: {
            bgPrimary: '#0f0f11',
            bgSecondary: '#1d1d21', // Slightly lighter
            textPrimary: '#e4e4e7',
            textSecondary: '#a1a1aa',
            border: '#27272a',
            accent: '#eab308', // Yellow-500
            accentTraffic: '#16a34a' // Green-600
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
            accent: '#bd93f9', // Purple
            accentTraffic: '#50fa7b' // Green
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
            accent: '#fd971f', // Orange
            accentTraffic: '#a6e22e' // Green
        },
        monacoTheme: 'vs-dark',
        monacoColors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2',
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
            accent: '#3b82f6', // Blue
            accentTraffic: '#22c55e' // Green-500
        },
        monacoTheme: 'vs',
        monacoColors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#18181b',
        }
    }
];
