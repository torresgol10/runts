import { describe, it, expect } from 'vitest';
import { transformCode } from '../transform';

describe('transformCode', () => {
    it('should add line markers to console.log calls', () => {
        const input = `console.log("hello");`;
        const output = transformCode(input);

        expect(output).toContain('[RUNTS_LINE:1]');
        expect(output).toContain('hello');
    });

    it('should handle multiple console statements', () => {
        const input = `console.log("line1");
console.log("line2");
console.log("line3");`;
        const output = transformCode(input);

        expect(output).toContain('[RUNTS_LINE:1]');
        expect(output).toContain('[RUNTS_LINE:2]');
        expect(output).toContain('[RUNTS_LINE:3]');
    });

    it('should preserve non-console code', () => {
        const input = `const x = 5;
console.log(x);
const y = x + 1;`;
        const output = transformCode(input);

        expect(output).toContain('const x = 5');
        expect(output).toContain('const y = x + 1');
    });

    it('should handle console.error and console.warn', () => {
        const input = `console.error("error");
console.warn("warning");`;
        const output = transformCode(input);

        expect(output).toContain('[RUNTS_LINE:1]');
        expect(output).toContain('[RUNTS_LINE:2]');
    });

    it('should handle empty input', () => {
        const output = transformCode('');
        expect(output).toBe('');
    });
});
