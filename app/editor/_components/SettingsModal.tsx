'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/_components/ui/Button';
import { X, Key, Save, Loader2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [groqKey, setGroqKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const stored = localStorage.getItem('groq_api_key');
        if (stored) setGroqKey(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    setSaving(true);
    // Simulate check or just save
    localStorage.setItem('groq_api_key', groqKey);
    setTimeout(() => {
        setSaving(false);
        onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0f1113] border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Settings size={16} className="text-accent" />
                            <h2 className="text-sm font-semibold text-white">Application Settings</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                             <label className="text-xs font-medium text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Key size={12} /> Groq API Key
                             </label>
                             <div className="relative">
                                <input 
                                    type="password"
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors font-mono"
                                />
                             </div>
                             <p className="text-[10px] text-gray-500 leading-relaxed">
                                Required for high-quality speech-to-text with punctuation and emotion. 
                                Keys are stored locally in your browser.
                             </p>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white gap-2">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Settings
                        </Button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
  );
}
