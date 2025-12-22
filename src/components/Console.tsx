import { Terminal, Trash2 } from 'lucide-react';
import Anser from 'anser';
import { useRef, useEffect } from 'react';

interface LogEntry {
    id: string;
    line?: number;
    content: string;
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

    // Prepare logs for display
    const renderContent = () => {
        if (!matchLines) {
            if (logs.length === 0) return <div className="text-gray-600 italic">No output yet...</div>;
            return logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-all border-b border-white/5 pb-0.5 mb-0.5">
                    {renderLogMessage(log.content)}
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

        // We suspect the user wants visual alignment. 
        // We will render blank lines for gaps.
        // NOTE: This assumes default line height alignment.
        for (let i = 1; i <= maxLine + 1; i++) {
            const lineLogs = logsByLine.get(i);
            if (lineLogs) {
                lineLogs.forEach((log, idx) => {
                    rows.push(
                        <div key={`${i}-${idx}`} className="whitespace-pre-wrap break-all bg-white/5 -mx-4 px-4 py-0.5 border-l-2 border-accent mb-[1px]">
                            <span className="text-xs text-gray-500 mr-2 w-10 inline-block text-right select-none">{i}:</span>
                            {renderLogMessage(log.content)}
                        </div>
                    );
                });
            } else {
                // Spacer for empty line
                // Height calculation is tricky, but we'll use a min-height that approximates code line
                rows.push(
                    <div key={`spacer-${i}`} className="h-[21px] w-full" />
                );
            }
        }

        return rows;
    };

    const renderLogMessage = (content: string) => (
        <>
            {Anser.ansiToJson(String(content || ''), { use_classes: true }).map((chunk, j) => (
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
        </>
    );

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
                {/* Optional Grid Background for alignment visualizing? No, too busy. */}
                {renderContent()}
                <div ref={endRef} />
            </div>
        </div>
    );
};
