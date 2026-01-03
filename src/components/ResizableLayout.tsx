// @ts-ignore
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Tab, LogEntry } from '../store/types';
import { CodeEditor } from './Editor';
import { Console } from './Console';
import { ThemeId } from '../utils/themes';
import { useState, useEffect } from 'react';

interface ResizableLayoutProps {
    activeTab: Tab | undefined;
    output: LogEntry[];
    clearOutput: () => void;
    matchLines: boolean;
    updateTabContent: (id: string, content: string) => void;
    theme: ThemeId;
}

export function ResizableLayout({ activeTab, output, clearOutput, matchLines, updateTabContent, theme }: ResizableLayoutProps) {
    const [direction, setDirection] = useState<'horizontal' | 'vertical'>('vertical');

    useEffect(() => {
        const checkSize = () => {
            // md is 768px in Tailwind
            if (window.innerWidth >= 768) {
                setDirection('horizontal');
            } else {
                setDirection('vertical');
            }
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    return (
        <PanelGroup orientation={direction} className="flex-1 h-full">
            <Panel defaultSize={60} minSize={20} className="flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-[#09090b]/50 backdrop-blur-sm -z-10" />
                <div className="w-full h-full">
                    {activeTab && (
                        <CodeEditor
                            value={activeTab.content}
                            onChange={(val) => updateTabContent(activeTab!.id, val || '')}
                            theme={theme}
                        />
                    )}
                    {!activeTab && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-accent animate-spin" />
                            </div>
                            <p className="font-mono text-sm opacity-50">Select or create a file</p>
                        </div>
                    )}
                </div>
            </Panel>

            <PanelResizeHandle className={`relative flex items-center justify-center bg-transparent transition-colors z-50 group hover:bg-white/5 rounded-full ${direction === 'horizontal' ? 'w-3 cursor-col-resize' : 'h-3 cursor-row-resize'}`}>
                <div className={`bg-white/20 rounded-full transition-colors group-hover:bg-accent/80 ${direction === 'horizontal' ? 'h-8 w-1' : 'w-8 h-1'}`} />
            </PanelResizeHandle>

            <Panel defaultSize={40} minSize={20} className="flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
                <Console
                    logs={output}
                    onClear={clearOutput}
                    matchLines={matchLines}
                />
            </Panel>
        </PanelGroup>
    );
}
