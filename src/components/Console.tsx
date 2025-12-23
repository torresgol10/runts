import { Terminal, Trash2 } from 'lucide-react';
import Anser from 'anser';
import { useRef, useEffect } from 'react';

interface LogEntry {
    id: string;
    line?: number;
    content: string;
    method?: 'log' | 'error' | 'warn' | 'info';
    timestamp: number;
}

interface ConsoleProps {
    logs: LogEntry[];
    onClear: () => void;
    matchLines?: boolean;
}

export const Console = ({ logs, onClear, matchLines }: ConsoleProps) => {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, matchLines]);

    const renderLogMessage = (log: LogEntry | string) => {
        // Handle both string (legacy) and LogEntry object
        const text = typeof log === 'string' ? log : (log.content || '');
        let className = 'text-gray-300'; // default

        // Priority to explicit method
        if (typeof log !== 'string' && log.method) {
            if (log.method === 'error') className = 'text-red-400';
            else if (log.method === 'warn') className = 'text-yellow-400';
            else if (log.method === 'info') className = 'text-blue-300';
        }

        // Fallback or override for System messages and heuristics
        if (text.startsWith('[System]')) className = 'text-blue-400 font-bold';
        if (text.startsWith('[RunTS]')) className = 'text-purple-400 font-bold';
        if (text.startsWith('[Error]')) className = 'text-red-400';

        // Use Anser for existing ANSI and wrap in our class
        return (
            <span className={className}>
                {Anser.ansiToJson(text, { use_classes: true }).map((chunk, j) => (
                    <span
                        key={j}
                        style={{
                            color: chunk.fg ? `rgb(${chunk.fg})` : undefined,
                            backgroundColor: chunk.bg ? `rgb(${chunk.bg})` : undefined,
                            fontWeight: chunk.decoration === 'bold' ? 'bold' : 'normal',
                        }}
                    >
                        {chunk.content}
                    </span>
                ))}
            </span>
        );
    };

    // Prepare logs for display
    const renderContent = () => {
        if (!matchLines) {
            if (logs.length === 0) return <div className="text-gray-600 italic">No output yet...</div>;
            return logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-all border-b border-white/5 pb-0.5 mb-0.5">
                    {renderLogMessage(log)}
                </div>
            ));
        }

        // MatchLines Mode: Insert spacers to align with code lines
        if (logs.length === 0) return <div className="text-gray-600 italic">No output yet...</div>;

        const maxLine = Math.max(...logs.map(l => l.line || 0), 0);
        const rows = [];
        const logsByLine = new Map<number, LogEntry[]>();

        logs.forEach(l => {
            const line = l.line || 0;
            if (!logsByLine.has(line)) logsByLine.set(line, []);
            logsByLine.get(line)?.push(l);
        });

        for (let i = 1; i <= maxLine + 1; i++) {
            const lineLogs = logsByLine.get(i);
            if (lineLogs) {
                lineLogs.forEach((log, idx) => {
                    rows.push(
                        <div key={`${i}-${idx}`} className="whitespace-pre-wrap break-all bg-white/5 -mx-4 px-4 py-0.5 border-l-2 border-accent mb-[1px]">
                            <span className="text-xs text-gray-500 mr-2 w-10 inline-block text-right select-none">{i}:</span>
                            {renderLogMessage(log)}
                        </div>
                    );
                });
            } else {
                // Spacer for empty line
                rows.push(
                    <div key={`spacer-${i}`} className="h-[21px] w-full" />
                );
            }
        }

        return rows;
    };

    return (
        <div className="flex flex-col h-full bg-secondary text-gray-300 font-mono text-sm border-t border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span className="font-semibold uppercase text-xs tracking-wider">
                        Console {matchLines ? '(Aligned)' : ''}
                    </span>
                </div>
                <button
                    onClick={onClear}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Clear Console"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-0 relative">
                {renderContent()}
                <div ref={endRef} />
            </div>
        </div>
    );
};
