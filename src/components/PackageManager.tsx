import { Package, Search, Download, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useDebounce } from '../hooks/useDebounce';

interface NpmSearchResult {
    package: {
        name: string;
        version: string;
        description: string;
    }
}

export const PackageManager = () => {
    const { dependencies, installPackage, uninstallPackage } = useStore();
    const [installInput, setInstallInput] = useState('');
    const [isInstalling, setIsInstalling] = useState(false);
    const [uninstallingPkg, setUninstallingPkg] = useState<string | null>(null);

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<NpmSearchResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const debouncedSearch = useDebounce(installInput, 300);

    useEffect(() => {
        const searchNpm = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoadingSuggestions(true);
            try {
                // Use a proxy or direct call if allowed. registry.npmjs.org allows CORS for search usually?
                // Actually registry.npmjs.org/ is strict sometimes, but let's try.
                // If it fails, we might need a proxy function, but for now we assume it works or user is local.
                const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${debouncedSearch}&size=5`);
                const data = await res.json();
                setSuggestions(data.objects || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch npm suggestions', error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        searchNpm();
    }, [debouncedSearch]);

    const handleInstall = async (e?: React.FormEvent, pkgName?: string) => {
        if (e) e.preventDefault();
        const pkg = pkgName || installInput;

        if (!pkg.trim()) return;

        setIsInstalling(true);
        setShowSuggestions(false); // Hide suggestions immediately
        await installPackage(pkg);
        setInstallInput('');
        setIsInstalling(false);
    };

    const handleUninstall = async (pkg: string) => {
        if (confirm(`Are you sure you want to uninstall ${pkg}?`)) {
            setUninstallingPkg(pkg);
            await uninstallPackage(pkg);
            setUninstallingPkg(null);
        }
    };

    return (
        <div className="p-4 w-80">
            <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Package size={16} className="text-accent" />
                NPM Packages
            </h3>

            <div className="relative mb-4">
                <form onSubmit={handleInstall} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-2 top-1.5 text-gray-500" />
                        <input
                            type="text"
                            value={installInput}
                            onChange={(e) => {
                                setInstallInput(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                            placeholder="Package name..."
                            className="w-full bg-black/30 border border-gray-700 rounded pl-8 pr-2 py-1 text-sm focus:outline-none focus:border-accent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isInstalling || !installInput}
                        className="bg-accent text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                        {isInstalling ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && installInput.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#25252b] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        {isLoadingSuggestions && (
                            <div className="p-2 text-center text-gray-400 text-xs">
                                <Loader2 size={14} className="animate-spin inline mr-2" />
                                Searching npm...
                            </div>
                        )}
                        {!isLoadingSuggestions && suggestions.map((result) => (
                            <div
                                key={result.package.name}
                                className="p-2 hover:bg-white/10 cursor-pointer border-b border-gray-700/50 last:border-0"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setInstallInput(result.package.name);
                                    handleInstall(undefined, result.package.name);
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm text-gray-200">{result.package.name}</span>
                                    <span className="text-[10px] text-gray-500 bg-black/20 px-1 rounded">{result.package.version}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">{result.package.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {Object.keys(dependencies).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-xs">
                        No packages installed
                    </div>
                )}

                {Object.entries(dependencies).map(([name, version]) => (
                    <div key={name} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs group">
                        <div>
                            <div className="font-bold text-gray-200 flex items-center gap-1">
                                {name}
                                <a
                                    href={`https://www.npmjs.com/package/${name}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-600 hover:text-white"
                                >
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                            <div className="text-gray-500 font-mono text-[10px]">{version}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-900/50 font-mono text-[10px]">
                                INSTALLED
                            </div>
                            <button
                                onClick={() => handleUninstall(name)}
                                disabled={!!uninstallingPkg}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-500 disabled:opacity-50"
                                title="Uninstall"
                            >
                                {uninstallingPkg === name ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
