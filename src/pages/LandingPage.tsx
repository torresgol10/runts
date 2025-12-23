import { Link } from 'react-router-dom';
import { Terminal, Zap, Lock, ArrowRight, Github } from 'lucide-react';
import { Logo } from '../components/Logo';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-accent selection:text-white">
            {/* Header */}
            <header className="absolute top-0 w-full z-50 border-b border-gray-800/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            RunTS
                        </span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <Github size={20} />
                        </a>
                        <Link
                            to="/playground"
                            className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 group"
                        >
                            Start Coding
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950/0 to-gray-950/0 pointer-events-none" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-gray-400 font-medium">v1.0 Now Available</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 leading-tight">
                        Instant TypeScript<br />
                        <span className="text-accent">Execution Environment</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        A powerful, secure, and instant TypeScript playground running entirely in your browser.
                        Powered by WebContainers for a full Node.js experience.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/playground"
                            className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            <Terminal size={20} />
                            Launch Editor
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 rounded-xl font-bold text-lg transition-all"
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="container mx-auto px-6 mt-16">
                    <div className="relative rounded-xl border border-gray-800 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden aspect-video max-w-5xl mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10" />

                        {/* Fake Browser UI */}
                        <div className="h-10 border-b border-gray-800 bg-gray-900 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            <div className="ml-4 px-3 py-1 bg-black/50 rounded text-xs text-gray-500 font-mono flex-1 text-center">
                                playground.runts.dev
                            </div>
                        </div>

                        {/* Abstract Code Preview */}
                        <div className="p-8 grid grid-cols-2 gap-8 font-mono text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="space-y-2">
                                <div className="text-purple-400">import <span className="text-white">{`{ writeFile, readFile }`}</span> from <span className="text-green-400">'node:fs/promises'</span>;</div>
                                <br />
                                <div className="text-gray-400">// Write to a file</div>
                                <div className="text-blue-400">await <span className="text-yellow-400">writeFile</span>(<span className="text-green-400">'message.txt'</span>, <span className="text-green-400">'Hello File System!'</span>);</div>
                                <br />
                                <div className="text-gray-400">// Read it back</div>
                                <div className="text-blue-400">const <span className="text-white">content</span> = await <span className="text-yellow-400">readFile</span>(<span className="text-green-400">'message.txt'</span>, <span className="text-green-400">'utf-8'</span>);</div>
                                <br />
                                <div className="text-white">console.log(content);</div>
                            </div>
                            <div className="bg-black/50 rounded-lg border border-gray-800 p-4 font-mono text-xs">
                                <div className="text-green-400">➜  ~ node index.ts</div>
                                <div className="text-white">Hello File System!</div>
                                <br />
                                <div className="text-green-400">➜  ~ cat message.txt</div>
                                <div className="text-white">Hello File System!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-gray-900/30 border-y border-gray-900">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Built for Modern Development</h2>
                        <p className="text-gray-400">Everything you need to experience TypeScript, right in your browser.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={<Terminal className="text-accent" />}
                            title="WebContainers"
                            description="Full Node.js environment running directly in your browser. Secure, fast, and no server setup required."
                        />
                        <FeatureCard
                            icon={<Zap className="text-yellow-400" />}
                            title="Instant Preview"
                            description="See your changes instantly. Hot Module Replacement (HMR) built-in for a seamless feedback loop."
                        />
                        <FeatureCard
                            icon={<Lock className="text-green-400" />}
                            title="Secure & Private"
                            description="Code never leaves your browser unless you choose to share it. Ideal for confidential experiments."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-800/50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <div>
                        © {new Date().getFullYear()} RunTS. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Github</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center mb-4 border border-gray-800">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
