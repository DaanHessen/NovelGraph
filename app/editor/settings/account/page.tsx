'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

import SettingsHeader from '../_components/SettingsHeader';
import SettingsSection from '../_components/SettingsSection';
import SettingItem from '../_components/SettingItem';
import { Input } from '@/app/_components/ui/Input';

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
                 <SettingsSection title="Public Profile">
                     <SettingItem
                        icon={User}
                        label="Author Name"
                        description="This name will be displayed on all your exported manuscripts."
                        control={
                           <div className="w-64">
                                <Input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter your pen name..."
                                    disabled={loading}
                                />
                                {saving && <span className="text-[10px] text-muted-foreground absolute top-1/2 -right-8 -translate-y-1/2 animate-pulse">Saving...</span>}
                            </div>
                        }
                     />
                 </SettingsSection>
             </div>
        </div>
    );
}
