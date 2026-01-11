import React from 'react';

interface SettingItemProps {
    icon?: React.ComponentType<{ size: number, className?: string }>;
    label: string;
    description?: string;
    control: React.ReactNode;
}

export default function SettingItem({ icon: Icon, label, description, control }: SettingItemProps) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors group">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="p-2 bg-accent/10 rounded-lg text-primary mt-0.5 group-hover:bg-accent/20 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
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
