import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from './useStore';

// Mock WebContainer
vi.mock('@webcontainer/api', () => ({
    WebContainer: {
        boot: vi.fn().mockResolvedValue({
            mount: vi.fn(),
            fs: {
                writeFile: vi.fn(),
                readFile: vi.fn(),
                rm: vi.fn(),
            },
            spawn: vi.fn().mockReturnValue({
                output: {
                    pipeTo: vi.fn(),
                },
                exit: Promise.resolve(0),
            }),
            on: vi.fn(),
        }),
    },
}));

describe('useStore', () => {
    beforeEach(() => {
        useStore.setState({
            envVars: {},
            snippets: [],
            dependencies: {},
            matchLines: true,
            tabs: [{ id: 'main', title: 'main.ts', content: '' }],
            activeTabId: 'main',
            output: [],
        });
    });

    it('should manage environment variables', () => {
        const { addEnvVar, removeEnvVar } = useStore.getState();

        addEnvVar('API_KEY', '12345');
        expect(useStore.getState().envVars).toEqual({ API_KEY: '12345' });

        removeEnvVar('API_KEY');
        expect(useStore.getState().envVars).toEqual({});
    });

    it('should manage snippets', () => {
        const { addSnippet, removeSnippet } = useStore.getState();

        addSnippet('Test Snippet', 'console.log("test")');
        const snippets = useStore.getState().snippets;
        expect(snippets).toHaveLength(1);
        expect(snippets[0]).toMatchObject({ name: 'Test Snippet', code: 'console.log("test")' });

        removeSnippet(snippets[0].id);
        expect(useStore.getState().snippets).toHaveLength(0);
    });

    it('should toggle matchLines preference', () => {
        const { toggleMatchLines } = useStore.getState();

        // Initial state is true (set in beforeEach)
        toggleMatchLines();
        expect(useStore.getState().matchLines).toBe(false);

        toggleMatchLines();
        expect(useStore.getState().matchLines).toBe(true);
    });

    it('should update tab content', () => {
        const { updateTabContent } = useStore.getState();

        updateTabContent('main', 'const a = 1;');
        expect(useStore.getState().tabs[0].content).toBe('const a = 1;');
    });
});
