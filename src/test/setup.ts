// import '@testing-library/jest-dom'; // No longer needed for Browser Mode
import { vi } from 'vitest';

// Mock WebContainer because it's not available in jsdom
vi.mock('@webcontainer/api', () => ({
    WebContainer: {
        boot: vi.fn(),
    },
}));

// Mock Monaco Editor because it's too complex for jsdom
vi.mock('@monaco-editor/react', () => ({
    default: () => null,
    useMonaco: () => ({
        editor: {
            defineTheme: vi.fn(),
            setTheme: vi.fn(),
        },
        languages: {
            typescript: {
                typescriptDefaults: {
                    setCompilerOptions: vi.fn(),
                    addExtraLib: vi.fn(),
                },
            },
        },
    }),
}));
