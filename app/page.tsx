'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Loader2 } from 'lucide-react';

function Logo() {
  return (
    <div className="flex flex-col items-center mb-12 select-none pointer-events-none">
      <pre className="font-mono text-[6px] sm:text-[8px] md:text-[10px] leading-none text-accent font-black tracking-tighter text-center whitespace-pre drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">
{`███    ██  ██████  ██    ██ ███████ ██       ██████  ██████   █████  ██████  ██   ██ 
████   ██ ██    ██ ██    ██ ██      ██      ██       ██   ██ ██   ██ ██   ██ ██   ██ 
██ ██  ██ ██    ██ ██    ██ █████   ██      ██   ███ ██████  ███████ ██████  ███████ 
██  ██ ██ ██    ██  ██  ██  ██      ██      ██    ██ ██   ██ ██   ██ ██      ██   ██ 
██   ████  ██████    ████   ███████ ███████  ██████  ██   ██ ██   ██ ██      ██   ██`}
      </pre>
    </div>
  );
}

function DbStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.db === 'connected' ? 'connected' : 'error');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur rounded-full border border-border/50 text-xs text-muted-foreground shadow-sm transition-all hover:bg-card">
      {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
      {status === 'connected' && (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-emerald-500 font-medium">database healthy</span>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-red-500 font-medium">connection error</span>
        </>
      )}
    </div>
  );
}

interface Project {
  id: string;
  slug: string;
  name: string;
  author?: string;
  last_opened?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ name: '', description: '', author: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?limit=5');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleStartNew = async () => {
    if (!modalData.name) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/editor?project=${project.slug}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const res = await fetch('/api/projects/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        if (res.ok) {
          fetchProjects();
        } else {
          alert('Import failed');
        }
      } catch (err) {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenProject = async (slug: string) => {
    await fetch('/api/projects/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
    });
    router.push(`/editor?project=${slug}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden selection:bg-accent selection:text-accent-foreground">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial="hidden"
        animate="show"
        variants={container}
        className="w-full max-w-2xl z-10 flex flex-col items-center"
      >
        <motion.div variants={item}>
            <Logo />
        </motion.div>

        <motion.div variants={item} className="flex gap-4 w-full mb-12 justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="group relative flex-1 max-w-[200px] h-32 bg-card hover:bg-accent/10 border border-border hover:border-accent transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                <Plus size={24} />
            </div>
            <span className="font-medium text-gray-300 group-hover:text-white transition-colors">New Project</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex-1 max-w-[200px] h-32 bg-card hover:bg-white/5 border border-border hover:border-gray-500 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
             <div className="p-3 rounded-full bg-gray-800 text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                <FolderOpen size={24} />
            </div>
            <span className="font-medium text-gray-300 group-hover:text-white transition-colors">Open Project</span>
          </button>
          
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImport}
          />
        </motion.div>

        <motion.div variants={item} className="w-full max-w-md">
            {projects.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2 pl-2">Recent</div>
                    {projects.map((p) => (
                        <motion.div
                            key={p.id}
                            layoutId={p.id}
                            onClick={() => handleOpenProject(p.slug)}
                            className="group flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-accent/50 hover:bg-accent/5 rounded-xl cursor-pointer transition-all duration-200"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{p.name}</span>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    {p.author && <span>{p.author}</span>}
                                    {p.last_opened && <span>• {new Date(p.last_opened).toLocaleDateString()}</span>}
                                </div>
                            </div>
                            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent">
                                <FolderOpen size={18} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
             {projects.length === 0 && !loading && (
                 <div className="text-center text-gray-500 py-8 text-sm">
                     No recent projects. Start something new.
                 </div>
             )}
        </motion.div>

      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-[#161618] border border-border shadow-2xl rounded-2xl p-6 overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-50" />
                
                <h2 className="text-2xl font-bold mb-6 text-white text-center">New Story</h2>
                
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 ml-1">Title</label>
                        <input
                            type="text"
                            placeholder="The Great Novel"
                            value={modalData.name}
                            onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                            className="w-full bg-black/40 border border-border focus:border-accent rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-700 font-medium"
                            autoFocus
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                         <label className="text-sm font-medium text-gray-400 ml-1">Author</label>
                        <input
                            type="text"
                            placeholder="Your Name (Optional)"
                            value={modalData.author}
                            onChange={(e) => setModalData({ ...modalData, author: e.target.value })}
                            className="w-full bg-black/40 border border-border focus:border-accent rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>
                     <div className="space-y-1.5">
                         <label className="text-sm font-medium text-gray-400 ml-1">Description</label>
                        <textarea
                            placeholder="A brief summary... (Optional)"
                            value={modalData.description}
                            onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                            className="w-full bg-black/40 border border-border focus:border-accent rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-700 min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                     <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 rounded-xl border border-border text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartNew}
                        disabled={!modalData.name}
                        className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] cursor-pointer"
                    >
                        Create Project
                    </button>
                </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <DbStatus />
    </div>
  );
}
