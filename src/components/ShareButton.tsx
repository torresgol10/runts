import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import lzString from 'lz-string';
import { useStore } from '../store/useStore';

export const ShareButton = () => {
    const { tabs, activeTabId, envVars, matchLines, snippets, theme } = useStore();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const stateToShare = {
            tabs,
            activeTabId,
            envVars,
            matchLines,
            snippets,
            theme
        };

        const json = JSON.stringify(stateToShare);
        const compressed = lzString.compressToEncodedURIComponent(json);
        const url = `${window.location.origin}${window.location.pathname}?code=${compressed}`;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`p-3 rounded-xl transition-all ${copied
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            title={copied ? "Copied!" : "Share Project URL"}
        >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
        </button>
    );
};
