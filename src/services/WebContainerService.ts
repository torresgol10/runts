import { getWebContainerInstance, writeFile } from '../webcontainer/instance';
import { transformCode } from '../utils/transform';
import ts from 'typescript';
import { LogEntry } from '../store/types';

export class WebContainerService {
    private activeProcess: any = null;

    async boot(dependencies: Record<string, string>) {
        const instance = await getWebContainerInstance();
        await instance.mount({
            'package.json': {
                file: {
                    contents: JSON.stringify({
                        name: 'runts-project',
                        type: 'module',
                        dependencies: dependencies,
                        scripts: { start: 'node index.js' }
                    })
                }
            },
            'index.js': {
                file: {
                    contents: 'console.log("Welcome to RunTS");'
                }
            }
        });
        return instance;
    }

    async install(pkg: string, onLog: (data: string) => void) {
        const instance = await getWebContainerInstance();
        const process = await instance.spawn('npm', ['install', pkg]);

        process.output.pipeTo(new WritableStream({
            write(data) { onLog(data); }
        }));

        await process.exit;
    }

    async uninstall(pkg: string, onLog: (data: string) => void) {
        const instance = await getWebContainerInstance();
        const process = await instance.spawn('npm', ['uninstall', pkg]);

        process.output.pipeTo(new WritableStream({
            write(data) { onLog(data); }
        }));

        await process.exit;
    }

    async restoreDependencies(onLog: (data: string) => void) {
        const instance = await getWebContainerInstance();
        const process = await instance.spawn('npm', ['install']);

        process.output.pipeTo(new WritableStream({
            write(data) { onLog(data); }
        }));

        await process.exit;
    }

    async refreshDependencies(): Promise<Record<string, string>> {
        try {
            const instance = await getWebContainerInstance();
            const raw = await instance.fs.readFile('package.json', 'utf-8');
            const json = JSON.parse(raw);
            return json.dependencies || {};
        } catch (e) {
            return {};
        }
    }

    async runCode(
        code: string,
        envVars: Record<string, string>,
        matchLines: boolean,
        onLog: (log: LogEntry) => void,
        onFinish: () => void
    ) {
        if (this.activeProcess) {
            this.activeProcess.kill();
        }

        try {
            const instance = await getWebContainerInstance();
            const codeToRun = matchLines ? transformCode(code) : code;

            const transpiled = ts.transpileModule(codeToRun, {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES2022,
                    esModuleInterop: true,
                }
            });

            // Console Shim
            const consoleShim = `
const { format } = require('util');

const __runts_log = console.log;

function safeLog(prefix, ...args) {
    const msg = format(...args);
    msg.split('\\n').forEach(line => __runts_log(prefix + line));
}

console.log = (...args) => safeLog('__RUNTS_LOG__', ...args);
console.error = (...args) => safeLog('__RUNTS_ERR__', ...args);
console.warn = (...args) => safeLog('__RUNTS_WRN__', ...args);
console.info = (...args) => safeLog('__RUNTS_INF__', ...args);

process.on('uncaughtException', (err) => {
    safeLog('__RUNTS_ERR__', 'Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    safeLog('__RUNTS_ERR__', 'Unhandled Rejection:', reason);
});
`;

            const finalCode = consoleShim + '\n' + transpiled.outputText;
            await writeFile('index.cjs', finalCode);

            const process = await instance.spawn('node', ['index.cjs'], {
                env: { ...envVars }
            });

            this.activeProcess = process;
            let streamBuffer = '';

            const processLine = (lineStr: string) => {
                let method: LogEntry['method'] = 'log';
                let content = lineStr;

                if (content.includes('__RUNTS_ERR__')) { method = 'error'; content = content.replace('__RUNTS_ERR__ ', '').replace('__RUNTS_ERR__', ''); }
                else if (content.includes('__RUNTS_WRN__')) { method = 'warn'; content = content.replace('__RUNTS_WRN__ ', '').replace('__RUNTS_WRN__', ''); }
                else if (content.includes('__RUNTS_INF__')) { method = 'info'; content = content.replace('__RUNTS_INF__ ', '').replace('__RUNTS_INF__', ''); }
                else if (content.includes('__RUNTS_LOG__')) { method = 'log'; content = content.replace('__RUNTS_LOG__ ', '').replace('__RUNTS_LOG__', ''); }

                let line: number | undefined;
                if (matchLines) {
                    const match = content.match(/\[RUNTS_LINE:(\d+)\]/);
                    if (match) {
                        try {
                            line = parseInt(match[1]);
                            content = content.replace(/\[RUNTS_LINE:\d+\]\s*,?\s*/, '');
                        } catch (e) { }
                    }
                }

                onLog({
                    id: Math.random().toString(36),
                    content: content,
                    line,
                    method,
                    timestamp: Date.now()
                });
            };

            process.output.pipeTo(new WritableStream({
                write(data) {
                    streamBuffer += data;
                    const lines = streamBuffer.split('\n');
                    streamBuffer = lines.pop() || '';
                    lines.forEach(lineStr => processLine(lineStr));
                }
            }));

            await process.exit;
            if (streamBuffer) processLine(streamBuffer);

        } catch (error: any) {
            onLog({ id: 'err', content: `[Error] ${error.message}`, timestamp: Date.now(), method: 'error' });
        } finally {
            this.activeProcess = null;
            onFinish();
        }
    }

    kill() {
        if (this.activeProcess) {
            this.activeProcess.kill();
            this.activeProcess = null;
        }
    }
}

export const webContainerService = new WebContainerService();
