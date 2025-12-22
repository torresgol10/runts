import { Package, Search, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export const PackageManager = () => {
    const { dependencies, installPackage } = useStore();
    const [installInput, setInstallInput] = useState('');
    const [isInstalling, setIsInstalling] = useState(false);

    const handleInstall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!installInput.trim()) return;
        setIsInstalling(true);
        await installPackage(installInput);
        setInstallInput('');
        setIsInstalling(false);
    };

    return (
        <div className="p-4 w-80">
            <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Package size={16} className="text-accent" />
                NPM Packages
            </h3>

            <form onSubmit={handleInstall} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-2 top-1.5 text-gray-500" />
                    <input
                        type="text"
                        value={installInput}
                        onChange={(e) => setInstallInput(e.target.value)}
                        placeholder="Package name..."
                        className="w-full bg-black/30 border border-gray-700 rounded pl-8 pr-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isInstalling || !installInput}
                    className="bg-accent text-black px-3 py-1 rounded text-xs font-bold hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isInstalling ? '...' : <Download size={14} />}
                </button>
            </form>

            <div className="space-y-2">
                {Object.keys(dependencies).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-xs">
                        No packages installed
                    </div>
                )}

                {Object.entries(dependencies).map(([name, version]) => (
                    <div key={name} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs group">
                        <div>
                            <div className="font-bold text-gray-200 hover:text-accent cursor-pointer flex items-center gap-1">
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
                        {/* Uninstall not implemented in webcontainer easily without 'npm uninstall', 
                            but we can just reinstall to add. Removing is tricker without rebuilding package.json manually.
                            We'll skip delete button for now or just make it visual only? 
                            Let's keep it simple: just list.
                        */}
                        <div className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-[10px]">
                            INSTALLED
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
