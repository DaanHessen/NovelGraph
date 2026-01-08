'use client';

interface SettingsHeaderProps {
    title: string;
    description: string;
}

export default function SettingsHeader({ title, description }: SettingsHeaderProps) {
    return (
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {title}
            </h1>
            <p className="text-gray-400 font-light leading-relaxed">{description}</p>
        </div>
    );
}
