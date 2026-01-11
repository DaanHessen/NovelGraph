'use client';

import { useState, useEffect } from 'react';
import { Settings, Grid3X3, Monitor, Map } from 'lucide-react';
import { Switch } from '@/app/_components/ui/Switch';

interface GraphSettingsState {
    snapToGrid: boolean;
    gridSpacing: number;
    showControls: boolean;
    showMiniMap: boolean;
    edgeStyle: string;
    connectionLineStyle: string;
    gridType: string;
    backgroundVariant: string;
}

export default function GraphSettings() {
    const [settings, setSettings] = useState<GraphSettingsState>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('graph-settings-global');
            if (saved) {
                try {
                    return {
                         snapToGrid: true,
                         gridSpacing: 20,
                         showControls: true,
                         showMiniMap: false,
                         edgeStyle: 'smoothstep',
                         connectionLineStyle: 'smoothstep',
                         gridType: 'dots',
                         backgroundVariant: 'dots',
                         ...JSON.parse(saved)
                    };
                } catch (e) { console.error(e); }
            }
        }
        return {
            snapToGrid: true,
            gridSpacing: 20,
            showControls: true,
            showMiniMap: false,
            edgeStyle: 'smoothstep', 
            connectionLineStyle: 'smoothstep',
            gridType: 'dots',
            backgroundVariant: 'dots', 
        };
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem('graph-settings-global', JSON.stringify(settings));
        }, 500);
        return () => clearTimeout(timeout);
    }, [settings]);

    const handleChange = (key: keyof GraphSettingsState, value: GraphSettingsState[keyof GraphSettingsState]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const gridOptions = ['dots', 'lines', 'cross'];
    const edgeOptions = ['default', 'straight', 'step', 'smoothstep', 'simple_bezier'];

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings size={20} className="text-accent" />
                Graph Editor
            </h2>

            <div className="space-y-6">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Grid3X3 size={14} /> Grid & Snapping
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                        <span className="text-white text-sm">Snap to Grid</span>
                        <Switch 
                            checked={settings.snapToGrid}
                            onCheckedChange={(v) => handleChange('snapToGrid', v)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Grid Spacing</span>
                            <span>{settings.gridSpacing}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" 
                            max="50" 
                            step="5"
                            value={settings.gridSpacing}
                            onChange={(e) => handleChange('gridSpacing', parseInt(e.target.value))}
                            className="w-full accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>


                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14} /> Visual Style
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Grid Style</label>
                        <div className="flex bg-black/20 rounded-lg p-1 border border-border">
                            {gridOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleChange('gridType', opt)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all uppercase ${settings.gridType === opt ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Edge Style</label>
                         <div className="grid grid-cols-3 gap-2">
                            {edgeOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleChange('edgeStyle', opt)}
                                    className={`py-2 px-2 text-[10px] font-medium rounded-lg border transition-all uppercase truncate ${settings.edgeStyle === opt ? 'bg-accent/20 border-accent text-accent' : 'bg-black/20 border-transparent text-muted-foreground hover:border-border/50'}`}
                                >
                                    {opt.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Connection Line Style</label>
                         <div className="grid grid-cols-3 gap-2">
                            {edgeOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleChange('connectionLineStyle', opt)}
                                    className={`py-2 px-2 text-[10px] font-medium rounded-lg border transition-all uppercase truncate ${settings.connectionLineStyle === opt ? 'bg-accent/20 border-accent text-accent' : 'bg-black/20 border-transparent text-muted-foreground hover:border-border/50'}`}
                                >
                                    {opt.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14} /> Interface
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                        <span className="text-white text-sm">Show Controls (Zoom/Fit)</span>
                        <Switch 
                            checked={settings.showControls}
                            onCheckedChange={(v) => handleChange('showControls', v)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Show MiniMap</span>
                            <Map size={14} className="text-gray-500" />
                        </div>
                        <Switch 
                            checked={settings.showMiniMap}
                            onCheckedChange={(v) => handleChange('showMiniMap', v)}
                        />
                    </div>
                </div>



            </div>
        </div>
    );
}
