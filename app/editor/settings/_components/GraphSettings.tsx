'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Grid3X3, Monitor, Map } from 'lucide-react';

export default function GraphSettings() {
    const [settings, setSettings] = useState({
        snapToGrid: true,
        gridSpacing: 20,
        showControls: true,
        showMiniMap: false,
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('graph-settings-global');
        if (saved) {
            try {
                setSettings({ ...settings, ...JSON.parse(saved) });
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSuccess(false);
    };

    const handleSave = () => {
        setSaving(true);
        // Simulate a small delay for feel, though generic localStorage is instant
        setTimeout(() => {
            localStorage.setItem('graph-settings-global', JSON.stringify(settings));
            setSaving(false);
            setSuccess(true);
            
            // Dispatch event for instant update if graph is open in another tab/window (optional, but good practice)
            //window.dispatchEvent(new Event('graph-settings-updated'));
        }, 500);
    };

    return (
        <div className="bg-card/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings size={20} className="text-accent" />
                Graph Editor
            </h2>

            <div className="space-y-6">
                
                {/* Grid Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Grid3X3 size={14} /> Grid & Snapping
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-white text-sm">Snap to Grid</span>
                        <button 
                            onClick={() => handleChange('snapToGrid', !settings.snapToGrid)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.snapToGrid ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.snapToGrid ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
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

                {/* UI Controls */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14} /> Interface
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-white text-sm">Show Controls (Zoom/Fit)</span>
                        <button 
                            onClick={() => handleChange('showControls', !settings.showControls)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.showControls ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showControls ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                         <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Show MiniMap</span>
                            <Map size={14} className="text-gray-500" />
                        </div>
                        <button 
                            onClick={() => handleChange('showMiniMap', !settings.showMiniMap)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.showMiniMap ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showMiniMap ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all ml-auto"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Preferences
                    </button>
                </div>
                 {success && (
                    <p className="text-emerald-500 text-sm font-medium animate-in fade-in slide-in-from-top-1 text-right">
                        Settings saved locally!
                    </p>
                )}

            </div>
        </div>
    );
}
