import React from 'react';

export default function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">{title}</h3>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden divide-y divide-border/50">
                {children}
            </div>
        </div>
    );
}
