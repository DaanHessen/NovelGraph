'use client';

import { useGraphStore, GraphSettings } from '../../graph/_store/useGraphStore';
import { Map as MapIcon, Magnet, ArrowRight, Activity, Grid } from 'lucide-react';
import SettingsHeader from '../_components/SettingsHeader';
import { Select } from '@/app/_components/ui/Select';
import { Switch } from '@/app/_components/ui/Switch';

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">{title}</h3>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {children}
            </div>
        </div>
    );
}

function SettingRow({ icon: Icon, label, description, control }: { icon: React.ComponentType<{ size: number }>, label: string, description?: string, control: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-accent/10 rounded-lg text-primary mt-0.5">
                    <Icon size={18} />
                </div>
                <div className="space-y-0.5 max-w-sm">
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    {description && <div className="text-xs text-muted-foreground leading-relaxed">{description}</div>}
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
                                    onChange={(e) => update('edgeType', e.target.value)}
                                    icon={Activity}
                                >
                                    <option value="default" className="bg-popover text-popover-foreground">Bezier Curves</option>
                                    <option value="straight" className="bg-popover text-popover-foreground">Straight Lines</option>
                                    <option value="step" className="bg-popover text-popover-foreground">Stepped</option>
                                    <option value="smoothstep" className="bg-popover text-popover-foreground">Smooth Stepped</option>
                                </Select>
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
                                    onChange={(e) => update('gridType', e.target.value)}
                                    icon={Grid}
                                >
                                    <option value="dots" className="bg-popover text-popover-foreground">Dots Pattern</option>
                                    <option value="lines" className="bg-popover text-popover-foreground">Lines Grid</option>
                                    <option value="cross" className="bg-popover text-popover-foreground">Cross Hatch</option>
                                </Select>
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
                                    onChange={(e) => update('connectionLineType', e.target.value)}
                                    icon={ArrowRight}
                                >
                                    <option value="default" className="bg-popover text-popover-foreground">Bezier Curves</option>
                                    <option value="straight" className="bg-popover text-popover-foreground">Straight</option>
                                    <option value="step" className="bg-popover text-popover-foreground">Stepped</option>
                                    <option value="smoothstep" className="bg-popover text-popover-foreground">Smooth Stepped</option>
                                </Select>
                            </div>
                        }
                    />
                     <SettingRow 
                        icon={Grid}
                        label="Show Grid"
                        description="Toggle the visibility of the background pattern."
                        control={
                            <Switch checked={graphSettings.showGrid} onCheckedChange={(v) => update('showGrid', v)} />
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
                                            onChange={(e) => {
                                                const size = parseInt(e.target.value);
                                                update('snapGrid', [size, size]);
                                            }}
                                            icon={Grid}
                                        >
                                            <option value="10" className="bg-popover text-popover-foreground">10px</option>
                                            <option value="15" className="bg-popover text-popover-foreground">15px</option>
                                            <option value="20" className="bg-popover text-popover-foreground">20px</option>
                                            <option value="25" className="bg-popover text-popover-foreground">25px</option>
                                        </Select>
                                    </div>
                                )}
                                <Switch checked={graphSettings.snapToGrid} onCheckedChange={(v) => update('snapToGrid', v)} />
                            </div>
                        }
                    />
                     <SettingRow 
                        icon={MapIcon}
                        label="Mini Map"
                        description="Show the navigation map in the corner."
                        control={
                            <Switch checked={graphSettings.showMinimap} onCheckedChange={(v) => update('showMinimap', v)} />
                        }
                    />
                </SettingsSection>
             </div>
        </div>
    );
}
