import { describe, it, expect } from 'vitest';
import { themes } from './themes';

describe('Themes Utils', () => {
    it('should have correct default themes structure', () => {
        expect(themes.length).toBeGreaterThan(0);

        const darkTheme = themes.find(t => t.id === 'runts-dark');
        expect(darkTheme).toBeDefined();
        expect(darkTheme?.colors.bgPrimary).toBe('#09090b');
    });

    it('should include new extra themes', () => {
        const nord = themes.find(t => t.id === 'nord');
        const solarized = themes.find(t => t.id === 'solarized-dark');
        const github = themes.find(t => t.id === 'github-light');

        expect(nord).toBeDefined();
        expect(solarized).toBeDefined();
        expect(github).toBeDefined();
    });
});
