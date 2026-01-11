'use client';

import { 
    Type, 
    AlignJustify, 
    MoveHorizontal, 
    Focus, 
    Keyboard, 
    BarChart2,
    Key 
} from 'lucide-react';
import { useWriteSettingsStore } from '../../write/_store/useWriteSettingsStore';

export default function WriteSettings() {
    const settings = useWriteSettingsStore();

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Type size={20} className="text-accent" />
                Write Interface
            </h2>

            <div className="space-y-6">
                
                {/* Typography Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Type size={14} /> Typography
                    </h3>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Font Size</span>
                            <span>{settings.fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">A</span>
                            <input 
                                type="range" 
                                min="12" 
                                max="32" 
                                step="1"
                                value={settings.fontSize}
                                onChange={(e) => settings.setFontSize(parseInt(e.target.value))}
                                className="flex-1 accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                            <span className="text-base text-gray-300">A</span>
                        </div>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-gray-400">
                            <span>Line Height</span>
                            <span>{settings.lineHeight}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="2.5" 
                            step="0.1"
                            value={settings.lineHeight}
                            onChange={(e) => settings.setLineHeight(parseFloat(e.target.value))}
                            className="w-full accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                     {/* Paragraph Spacing */}
                     <div className="space-y-2">
                         <div className="flex justify-between text-xs text-gray-400">
                            <span>Paragraph Spacing</span>
                            <span>{settings.paragraphSpacing}em</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="3" 
                            step="0.1"
                            value={settings.paragraphSpacing}
                            onChange={(e) => settings.setParagraphSpacing(parseFloat(e.target.value))}
                            className="w-full accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                     {/* Font Family Selection - Simple for now */}
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500">Font Family</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['sans', 'serif', 'mono'].map(font => (
                                <button
                                    key={font}
                                    onClick={() => settings.setFontFamily(font)}
                                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all uppercase ${settings.fontFamily === font ? 'bg-accent/20 border-accent text-accent' : 'bg-black/20 border-transparent text-muted-foreground hover:border-border/50'}`}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Layout Section */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <AlignJustify size={14} /> Layout
                    </h3>

                    {/* Width */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Editor Max Width</span>
                            <span>{settings.maxWidth}ch</span>
                        </div>
                         <div className="flex items-center gap-2">
                             <MoveHorizontal size={14} className="text-gray-500"/>
                            <input 
                                type="range" 
                                min="40" 
                                max="120" 
                                step="1"
                                value={settings.maxWidth}
                                onChange={(e) => settings.setMaxWidth(parseInt(e.target.value))}
                                className="flex-1 accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* Interface Section */}
                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Focus size={14} /> Experience
                    </h3>
                    
                    {/* Focus Mode */}
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                         <div className="flex items-center gap-3">
                             <Focus size={18} className="text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">Focus Mode</span>
                                <span className="text-[10px] text-gray-500">Fade out UI elements while typing</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => settings.setFocusMode(!settings.focusMode)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.focusMode ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.focusMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Typewriter Mode */}
                     <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                         <div className="flex items-center gap-3">
                             <Keyboard size={18} className="text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">Typewriter Mode</span>
                                <span className="text-[10px] text-gray-500">Keep cursor vertically centered</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => settings.setTypewriterMode(!settings.typewriterMode)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.typewriterMode ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.typewriterMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Stats */}
                     <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                         <div className="flex items-center gap-3">
                             <BarChart2 size={18} className="text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium">Show Statistics</span>
                                <span className="text-[10px] text-gray-500">Word count and reading time</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => settings.setShowStats(!settings.showStats)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.showStats ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.showStats ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Key size={14} /> AI Configuration
                    </h3>
                    
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs text-gray-400">
                            <span>Groq API Key (for speech-to-text)</span>
                        </div>
                        <input 
                            type="password" 
                            value={settings.groqApiKey}
                            onChange={(e) => settings.setGroqApiKey(e.target.value)}
                            placeholder="gsk_..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all placeholder:text-gray-600 font-mono"
                        />
                         <p className="text-[10px] text-gray-500">
                            Keys are stored locally in your browser.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
