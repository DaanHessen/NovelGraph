'use client';

import { useGraphStore, GraphSettings } from '../../graph/_store/useGraphStore';
import { Map as MapIcon, Magnet, ArrowRight, Activity, Grid } from 'lucide-react';
import clsx from 'clsx';
import SettingsHeader from '../_components/SettingsHeader';


// Use React.ComponentType for the icon prop to avoid 'any'
function Select({ value, onChange, options, icon: Icon }: { value: string, onChange: (v: string) => void, options: { label: string, value: string }[], icon: React.ComponentType<{ size: number }> }) {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Icon size={16} />
            </div>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer hover:bg-white/10"
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
                "relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:ring-indigo-500",
                value ? "bg-linear-to-r from-indigo-500 to-purple-500" : "bg-white/10"
            )}
        >
            <span 
                className={clsx(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-300",
                    value ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
}

// Shared components for clean settings list
function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">{title}</h3>
            <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {children}
            </div>
        </div>
    );
}

function SettingRow({ icon: Icon, label, description, control }: { icon: React.ComponentType<{ size: number }>, label: string, description?: string, control: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-0.5">
                    <Icon size={18} />
                </div>
                <div className="space-y-0.5 max-w-sm">
                    <div className="text-sm font-medium text-gray-200">{label}</div>
                    {description && <div className="text-xs text-gray-500 leading-relaxed">{description}</div>}
                </div>
            </div>
            <div className="shrink-0 ml-4">
                {control}
            </div>
        </div>
    );
}

export default function GraphSettingsPage() {
    const { graphSettings, setGraphSettings } = useGraphStore();
    
    if (!graphSettings) return null;

    const update = (key: keyof GraphSettings, value: unknown) => {
        setGraphSettings({ [key]: value });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 ease-out py-8">
             <SettingsHeader 
                title="Graph Experience" 
                description="Customize interactions, visual style, and performance of the node graph."
             />

             <div className="space-y-8">
                <SettingsSection title="Visual Style">
                    <SettingRow 
                        icon={Activity}
                        label="Connection Style"
                        description="How nodes connect visually. Affects all edges."
                        control={
                            <div className="w-48">
                                <Select 
                                    value={graphSettings.edgeType}
                                    onChange={(v) => update('edgeType', v)}
                                    options={[
                                        { label: 'Bezier Curves', value: 'default' },
                                        { label: 'Straight Lines', value: 'straight' },
                                        { label: 'Stepped', value: 'step' },
                                        { label: 'Smooth Stepped', value: 'smoothstep' },
                                    ]}
                                    icon={Activity}
                                />
                            </div>
                        }
                    />
                    <SettingRow 
                        icon={Grid}
                        label="Background Grid"
                        description="The pattern displayed in the infinite canvas."
                        control={
                            <div className="w-48">
                                <Select 
                                    value={graphSettings.gridType}
                                    onChange={(v) => update('gridType', v)}
                                    options={[
                                        { label: 'Dots Pattern', value: 'dots' },
                                        { label: 'Lines Grid', value: 'lines' },
                                        { label: 'Cross Hatch', value: 'cross' },
                                    ]}
                                    icon={Grid}
                                />
                            </div>
                        }
                    />
                </SettingsSection>

                <SettingsSection title="Interactions">
                    <SettingRow 
                        icon={ArrowRight}
                        label="Interaction Line"
                        description="Style of the temporary line when connecting nodes."
                        control={
                            <div className="w-48">
                                <Select 
                                    value={graphSettings.connectionLineType}
                                    onChange={(v) => update('connectionLineType', v)}
                                    options={[
                                        { label: 'Bezier Curves', value: 'default' },
                                        { label: 'Straight', value: 'straight' },
                                        { label: 'Stepped', value: 'step' },
                                        { label: 'Smooth Stepped', value: 'smoothstep' },
                                    ]}
                                    icon={ArrowRight}
                                />
                            </div>
                        }
                    />
                     <SettingRow 
                        icon={Grid}
                        label="Show Grid"
                        description="Toggle the visibility of the background pattern."
                        control={
                            <Toggle value={graphSettings.showGrid} onChange={(v) => update('showGrid', v)} />
                        }
                    />
                    <SettingRow 
                        icon={Magnet}
                        label="Snap to Grid"
                        description="Automatically align nodes to the grid layout."
                        control={
                            <div className="flex items-center gap-3">
                                {graphSettings.snapToGrid && (
                                    <div className="w-24">
                                         <Select 
                                            value={String(graphSettings.snapGrid?.[0] || 15)}
                                            onChange={(v) => {
                                                const size = parseInt(v);
                                                update('snapGrid', [size, size]);
                                            }}
                                            options={[
                                                { label: '10px', value: '10' },
                                                { label: '15px', value: '15' },
                                                { label: '20px', value: '20' },
                                                { label: '25px', value: '25' },
                                            ]}
                                            icon={Grid}
                                        />
                                    </div>
                                )}
                                <Toggle value={graphSettings.snapToGrid} onChange={(v) => update('snapToGrid', v)} />
                            </div>
                        }
                    />
                     <SettingRow 
                        icon={MapIcon}
                        label="Mini Map"
                        description="Show the navigation map in the corner."
                        control={
                            <Toggle value={graphSettings.showMinimap} onChange={(v) => update('showMinimap', v)} />
                        }
                    />
                </SettingsSection>
             </div>
        </div>
    );
}
