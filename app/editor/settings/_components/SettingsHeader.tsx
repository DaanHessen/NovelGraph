'use client';

import clsx from 'clsx';

interface SettingsHeaderProps {
    title: string;
    description: string;
    gradient?: string;
}

export default function SettingsHeader({ title, description, gradient }: SettingsHeaderProps) {
    return (
        <div className="space-y-2 mb-8">
            <h1 className={clsx(
                "text-3xl font-bold bg-clip-text text-transparent tracking-tight",
                gradient || "bg-gradient-to-r from-gray-200 to-gray-400"
            )}>
                {title}
            </h1>
            <p className="text-gray-400 font-light leading-relaxed">{description}</p>
        </div>
    );
}
