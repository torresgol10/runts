import { describe, it, expect } from 'vitest';
import { createUIFeature } from './ui';
import { create } from 'zustand';
import { RuntsState } from '../types';

const useTestStore = create<RuntsState>((set, get, api) => ({
    ...createUIFeature(set, get, api)
} as any));

describe('UI Feature', () => {
    it('sets theme', () => {
        const store = useTestStore.getState();
        store.setTheme('github-light');
        expect(useTestStore.getState().theme).toBe('github-light');
    });

    it('manages env vars', () => {
        const store = useTestStore.getState();
        store.addEnvVar('API_KEY', '12345');
        expect(useTestStore.getState().envVars['API_KEY']).toBe('12345');

        store.removeEnvVar('API_KEY');
        expect(useTestStore.getState().envVars['API_KEY']).toBeUndefined();
    });

    it('manages snippets', () => {
        const store = useTestStore.getState();
        const initialCount = store.snippets.length;

        store.addSnippet('MySnippet', 'console.log("test")');
        const updated = useTestStore.getState();
        expect(updated.snippets).toHaveLength(initialCount + 1);
        expect(updated.snippets[updated.snippets.length - 1].name).toBe('MySnippet');

        const idToRemove = updated.snippets[updated.snippets.length - 1].id;
        store.removeSnippet(idToRemove);
        expect(useTestStore.getState().snippets).toHaveLength(initialCount);
    });
});
