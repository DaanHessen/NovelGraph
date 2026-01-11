'use client';

import { useGraphStore, GraphSettings } from '../../graph/_store/useGraphStore';
import { Map as MapIcon, Magnet, ArrowRight, Activity, Grid } from 'lucide-react';
import SettingsHeader from '../_components/SettingsHeader';
import SettingsSection from '../_components/SettingsSection';
import SettingItem from '../_components/SettingItem';
import { Select } from '@/app/_components/ui/Select';
import { Switch } from '@/app/_components/ui/Switch';

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
                    <SettingItem 
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
                    <SettingItem 
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
                    <SettingItem 
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
                     <SettingItem 
                        icon={Grid}
                        label="Show Grid"
                        description="Toggle the visibility of the background pattern."
                        control={
                            <Switch checked={graphSettings.showGrid} onCheckedChange={(v) => update('showGrid', v)} />
                        }
                    />
                    <SettingItem 
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
                     <SettingItem 
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

