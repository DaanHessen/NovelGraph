'use client';

import { useGraphStore, GraphSettings } from '../../graph/_store/useGraphStore';
import { LayoutGrid, Map as MapIcon, Magnet, ArrowRight, Activity, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function SettingSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="group relative">
             {/* Glow effect */}
             <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
             
             <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-white/10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-1 max-w-sm">
                        <h3 className="text-base font-semibold text-gray-200">{title}</h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">{description}</p>
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                        {children}
                    </div>
                </div>
             </div>
        </div>
    );
}

function Select({ value, onChange, options, icon: Icon }: { value: string, onChange: (v: string) => void, options: { label: string, value: string }[], icon: any }) {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Icon size={16} />
            </div>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer hover:bg-white/10"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0f1113] text-gray-300">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    );
}

function Toggle({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) {
    return (
        <button 
            onClick={() => onChange(!value)}
            className={clsx(
                "relative h-7 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:ring-indigo-500",
                value ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-white/10"
            )}
        >
            <span 
                className={clsx(
                    "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-300",
                    value ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
}

export default function GraphSettingsPage() {
    const { graphSettings, setGraphSettings } = useGraphStore();
    
    // Safety check if settings aren't loaded yet
    if (!graphSettings) return null;

    const update = (key: keyof GraphSettings, value: any) => {
        setGraphSettings({ [key]: value });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out py-10">
             <div className="space-y-2 mb-8">
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">Graph Experience</h1>
                 <p className="text-gray-400 font-light leading-relaxed">Customize interactions, visual style, and performance of the node graph.</p>
             </div>

             <div className="space-y-4">
                <SettingSection title="Connection Style" description="Choose how nodes visually connect to each other. Affects all edges in the graph.">
                    <Select 
                        icon={Activity}
                        value={graphSettings.edgeType}
                        onChange={(v) => update('edgeType', v)}
                        options={[
                            { label: 'Beziér Curves (Default)', value: 'default' },
                            { label: 'Straight Lines', value: 'straight' },
                            { label: 'Stepped (Orthogonal)', value: 'step' },
                            { label: 'Smooth Stepped', value: 'smoothstep' },
                        ]}
                    />
                </SettingSection>

                <SettingSection title="Interaction Line" description="The style of the line while you are dragging to create a new connection.">
                    <Select 
                        icon={ArrowRight}
                        value={graphSettings.connectionLineType}
                        onChange={(v) => update('connectionLineType', v)}
                        options={[
                            { label: 'Beziér Curves', value: 'default' },
                            { label: 'Straight', value: 'straight' },
                            { label: 'Stepped', value: 'step' },
                            { label: 'Smooth Stepped', value: 'smoothstep' },
                        ]}
                    />
                </SettingSection>

                <SettingSection title="Background Grid" description="The pattern displayed in the infinite canvas background.">
                    <div className="space-y-4">
                        <Select 
                            icon={Grid}
                            value={graphSettings.gridType}
                            onChange={(v) => update('gridType', v)}
                            options={[
                                { label: 'Dots Pattern', value: 'dots' },
                                { label: 'Lines Grid', value: 'lines' },
                                { label: 'Cross Hatch', value: 'cross' },
                            ]}
                        />
                         <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                            <span className="text-sm text-gray-300">Show Grid</span>
                            <Toggle value={graphSettings.showGrid} onChange={(v) => update('showGrid', v)} />
                        </div>
                    </div>
                </SettingSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
                        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <MapIcon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-200">Mini Map</span>
                                    <span className="text-xs text-gray-500">Show navigation map</span>
                                </div>
                            </div>
                            <Toggle value={graphSettings.showMinimap} onChange={(v) => update('showMinimap', v)} />
                        </div>
                     </div>

                     <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700"></div>
                        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Magnet size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-200">Snap to Grid</span>
                                    <span className="text-xs text-gray-500">Align nodes automatically</span>
                                </div>
                            </div>
                            <Toggle value={graphSettings.snapToGrid} onChange={(v) => update('snapToGrid', v)} />
                        </div>
                     </div>
                </div>

             </div>
        </div>
    );
}
