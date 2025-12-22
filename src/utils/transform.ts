import ts from 'typescript';

export const transformCode = (code: string, fileName: string = 'index.ts'): string => {
    try {
        const sourceFile = ts.createSourceFile(
            fileName,
            code,
            ts.ScriptTarget.ESNext,
            true
        );

        let magicCode = code;
        const replacements: { start: number; end: number; text: string }[] = [];

        const visit = (node: ts.Node) => {
            if (ts.isCallExpression(node)) {
                const expression = node.expression;
                if (
                    ts.isPropertyAccessExpression(expression) &&
                    ts.isIdentifier(expression.expression) &&
                    expression.expression.text === 'console' &&
                    ['log', 'info', 'warn', 'error', 'debug'].includes(expression.name.text)
                ) {
                    // Line numbers are 0-indexed in TS, so we add 1
                    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                    const args = node.arguments;
                    if (args.length > 0) {
                        const start = args[0].getStart();
                        replacements.push({
                            start: start,
                            end: start,
                            text: `"[RUNTS_LINE:${line}]", `
                        });
                    }
                }
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        // Apply replacements in reverse order
        replacements.sort((a, b) => b.start - a.start).forEach(r => {
            magicCode = magicCode.substring(0, r.start) + r.text + magicCode.substring(r.end);
        });

        return magicCode;
    } catch (e) {
        console.error("Transform error:", e);
        return code;
    }
};
