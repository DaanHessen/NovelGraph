'use client';

import { useState, useEffect } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import GraphSettings from './_components/GraphSettings';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, avatar: null }),
      });
      if (res.ok) {
        setSuccess(true);
        // Force a reload or event dispatch to update sidebar? 
        // For simplicity, we can rely on next navigation or a global context/SWR later.
        // But for now, let's trigger a custom event or just let the user see "Saved".
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 mb-10">Manage your profile and preferences.</p>

      <div className="bg-card/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-accent" />
            Profile
        </h2>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Author Name</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-all"
                        placeholder="Enter your name"
                        disabled={loading}
                    />
                    <button 
                        onClick={handleSave}
                        disabled={loading || saving || !username.trim()}
                        className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save
                    </button>
                </div>
                 {success && (
                    <p className="text-emerald-500 text-sm mt-2 font-medium animate-in fade-in slide-in-from-top-1">
                        Profile updated successfully!
                    </p>
                )}
            </div>
        </div>
      </div>

      <div className="mt-8">
        <GraphSettings />
      </div>
    </div>
  );
}
