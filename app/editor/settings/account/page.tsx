'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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

    // Auto-save debouncer
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
        <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700 ease-out py-10">
             <div className="space-y-2">
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">Profile Settings</h1>
                 <p className="text-gray-400 font-light leading-relaxed">Manage your public persona and how you appear across the platform.</p>
             </div>

             <div className="group relative">
                 {/* Glow effect behind the card */}
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-1000"></div>
                 
                 <div className="relative space-y-8 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                     <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 ml-1">Author Name</label>
                            <div className="relative group/input">
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                                    placeholder="Enter your pen name..."
                                    disabled={loading}
                                />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {saving ? (
                                        <Loader2 size={18} className="animate-spin text-emerald-500" />
                                    ) : (
                                        <div className="flex items-center gap-2 transition-all duration-500 opacity-0 group-hover/input:opacity-100">
                                            <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-wider">Saved</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 ml-1">This name will be displayed on all your exported manuscripts.</p>
                        </div>
                     </div>
                 </div>
             </div>
        </div>
    );
}
