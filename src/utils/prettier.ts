import prettier from 'prettier/standalone';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserTypescript from 'prettier/plugins/typescript';

export const formatCode = async (code: string): Promise<string> => {
    try {
        return await prettier.format(code, {
            parser: 'typescript',
            plugins: [parserEstree, parserTypescript] as any,
            singleQuote: true,
            tabWidth: 4,
            printWidth: 100,
        });
    } catch (e) {
        console.error('Prettier format failed:', e);
        return code;
    }
};
