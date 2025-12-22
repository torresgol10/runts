import { describe, it, expect } from 'vitest';
import { transformCode } from './transform';

describe('transformCode', () => {
    it('injects line numbers into console.log', () => {
        const input = `
console.log('Hello');
const x = 5;
console.info('Value:', x);
`;
        const output = transformCode(input);

        expect(output).toContain('console.log("[RUNTS_LINE:2]", \'Hello\');');
        expect(output).toContain('console.info("[RUNTS_LINE:4]", \'Value:\', x);');
    });

    it('handles single line console.log', () => {
        const input = `console.log('test');`;
        const output = transformCode(input);
        expect(output).toContain('console.log("[RUNTS_LINE:1]", \'test\');');
    });

    it('ignores empty console.log', () => {
        const input = `console.log();`;
        const output = transformCode(input);
        expect(output).toBe(input);
    });

    it('handles nested structures', () => {
        const input = `
if (true) {
    console.log('nested');
}
`;
        const output = transformCode(input);
        expect(output).toContain('console.log("[RUNTS_LINE:3]", \'nested\');');
    });
});
