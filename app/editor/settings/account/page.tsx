'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import SettingsHeader from '../_components/SettingsHeader';

export default function AccountSettingsPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings/profile')
          .then((res) => res.json())
          .then((data) => {
            if (data.username) setUsername(data.username);
          })
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (loading || !username) return;

        const timer = setTimeout(async () => {
            setSaving(true);
            try {
                await fetch('/api/settings/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, avatar: null }),
                });
            } catch (e) {
                console.error(e);
            } finally {
                setSaving(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [username, loading]);

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 ease-out py-8">
             <SettingsHeader 
                title="Profile Settings" 
                description="Manage your public persona and how you appear across the platform."
             />

             <div className="space-y-8">
                 <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">Public Profile</h3>
                    <div className="bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <div className="p-4 hover:bg-white/2 transition-colors">
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-gray-200">Author Name</label>
                                <div className="relative group/input max-w-md">
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                                        placeholder="Enter your pen name..."
                                        disabled={loading}
                                    />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {saving ? (
                                            <Loader2 size={14} className="animate-spin text-emerald-500" />
                                        ) : (
                                            <div className="flex items-center gap-2 transition-all duration-500 opacity-0 group-hover/input:opacity-100">
                                                <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-wider">Saved</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">This name will be displayed on all your exported manuscripts.</p>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    );
}
