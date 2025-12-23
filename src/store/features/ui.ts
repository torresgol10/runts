import { StateCreator } from 'zustand';
import { RuntsState } from '../types';

export const createUIFeature: StateCreator<RuntsState> = (set) => ({
    theme: 'runts-dark',
    envVars: {},
    snippets: [
        { id: '1', name: 'Log', code: 'console.log();' },
        { id: '2', name: 'Timeout', code: 'setTimeout(() => {\n  \n}, 1000);' }
    ],

    setTheme: (theme) => set({ theme }),

    addEnvVar: (key, value) => set(state => ({ envVars: { ...state.envVars, [key]: value } })),

    removeEnvVar: (key) => set(state => {
        const { [key]: _, ...rest } = state.envVars;
        return { envVars: rest };
    }),

    addSnippet: (name, code) => set(state => ({
        snippets: [...state.snippets, { id: Math.random().toString(36), name, code }]
    })),

    removeSnippet: (id) => set(state => ({
        snippets: state.snippets.filter(s => s.id !== id)
    })),

    deserialize: (newState) => set(state => ({ ...state, ...newState }))
});
