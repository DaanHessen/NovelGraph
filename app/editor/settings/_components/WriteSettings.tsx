'use client';

import { 
    Type, 
    AlignJustify, 
    Focus, 
    Keyboard, 
    BarChart2,
    Key 
} from 'lucide-react';
import { useWriteSettingsStore } from '../../write/_store/useWriteSettingsStore';
import SettingsHeader from './SettingsHeader';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { Slider } from '@/app/_components/ui/Slider';
import { Switch } from '@/app/_components/ui/Switch';
import { Select } from '@/app/_components/ui/Select';
import { Input } from '@/app/_components/ui/Input';

export default function WriteSettings() {
    const settings = useWriteSettingsStore();

    return (
        <div className="space-y-10">
             <SettingsHeader 
                title="Write Interface" 
                description="Customize your writing environment for maximum focus and comfort."
             />

            <div className="space-y-8">
                
                {/* Typography Section */}
                <SettingsSection title="Typography">
                    <SettingItem
                        icon={Type}
                        label="Font Size"
                        description={`${settings.fontSize}px`}
                        control={
                            <div className="w-48 flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">A</span>
                                <Slider 
                                    min={12} 
                                    max={32} 
                                    step={1}
                                    value={settings.fontSize}
                                    onChange={(val) => settings.setFontSize(val)}
                                />
                                <span className="text-base text-muted-foreground">A</span>
                            </div>
                        }
                    />

                    <SettingItem
                        label="Line Height"
                        description={`${settings.lineHeight}`}
                        control={
                            <div className="w-48">
                                <Slider 
                                    min={1.0} 
                                    max={2.5} 
                                    step={0.1}
                                    value={settings.lineHeight}
                                    onChange={(val) => settings.setLineHeight(val)}
                                />
                            </div>
                        }
                    />

                     <SettingItem
                        label="Paragraph Spacing"
                        description={`${settings.paragraphSpacing}em`}
                        control={
                            <div className="w-48">
                                <Slider 
                                    min={0} 
                                    max={3} 
                                    step={0.1}
                                    value={settings.paragraphSpacing}
                                    onChange={(val) => settings.setParagraphSpacing(val)}
                                />
                            </div>
                        }
                    />

                     <SettingItem
                        label="Font Family"
                        description="Choose your preferred typeface."
                        control={
                            <div className="w-48">
                                <Select
                                    value={settings.fontFamily}
                                    onChange={(e) => settings.setFontFamily(e.target.value)}
                                >
                                    <option value="sans">Sans Serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                </Select>
                            </div>
                        }
                    />
                </SettingsSection>


                {/* Layout Section */}
                 <SettingsSection title="Layout">
                    <SettingItem
                        icon={AlignJustify}
                        label="Editor Max Width"
                        description={`Limit line length for readability: ${settings.maxWidth}ch`}
                        control={
                            <div className="w-48 flex items-center gap-2">
                                <Slider 
                                    min={40} 
                                    max={120} 
                                    step={1}
                                    value={settings.maxWidth}
                                    onChange={(val) => settings.setMaxWidth(val)}
                                />
                            </div>
                        }
                    />
                </SettingsSection>

                {/* Interface Section */}
                <SettingsSection title="Experience">
                    <SettingItem
                        icon={Focus}
                        label="Focus Mode"
                        description="Fade out UI elements while typing."
                        control={
                            <Switch checked={settings.focusMode} onCheckedChange={(v) => settings.setFocusMode(v)} />
                        }
                    />
                    
                    <SettingItem
                        icon={Keyboard}
                        label="Typewriter Mode"
                        description="Keep cursor vertically centered."
                        control={
                            <Switch checked={settings.typewriterMode} onCheckedChange={(v) => settings.setTypewriterMode(v)} />
                        }
                    />

                     <SettingItem
                        icon={BarChart2}
                        label="Show Statistics"
                        description="Word count and reading time."
                        control={
                            <Switch checked={settings.showStats} onCheckedChange={(v) => settings.setShowStats(v)} />
                        }
                    />
                </SettingsSection>

                
                <SettingsSection title="AI Configuration">
                    <SettingItem
                        icon={Key}
                        label="Groq API Key"
                        description="Required for speech-to-text features. Stored locally."
                        control={
                           <div className="w-64">
                                <Input 
                                    type="password" 
                                    value={settings.groqApiKey}
                                    onChange={(e) => settings.setGroqApiKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="font-mono text-xs"
                                />
                           </div>
                        }
                    />
                </SettingsSection>

            </div>
        </div>
    );
}

