import { describe, it, expect } from 'vitest';
import { formatCode } from './prettier';

describe('Prettier Utils', () => {
    it('should format code correctly', async () => {
        const input = 'const a=1;    console.log(  "test"  )';
        const output = await formatCode(input);

        // Prettier might add newlines/semicolons depending on defaults
        expect(output).toContain('const a = 1;');
        expect(output).toContain("console.log('test');");
    });

    it('should handle invalid code gracefully', async () => {
        const input = 'const a = ;'; // Syntax error
        const output = await formatCode(input);

        // Should return original content on error
        expect(output).toBe(input);
    });
});
