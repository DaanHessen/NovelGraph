'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  slug: string;
  name: string;
  author?: string;
  last_opened?: string;
}

export default function WelcomePage() {
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
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenProject = async (slug: string) => {
    // Ideally update last_opened here via API or assume API GET sorts by it anyway and just navigate.
    // The requirement says: "calls backend to update last_opened = now() then redirect"
    // We didn't build a specific "open" API, but we can do a quick PATCH or just use a specific endpoint?
    // Requirement says: "Clicking Open... calls backend to update last_opened".
    // I'll assume just navigating is NOT enough if I want to strictly follow "update last_opened".
    // But I didn't create a `PATCH /api/projects/[id]` endpoint in my plan.
    // I will implement a quick workaround: Re-fetch project detail (which might touch it? No.)
    // I'll add a quick fetch to `/api/projects?slug=...` which is GET.
    // Wait, the "Open" button should preferably hit an actual endpoint.
    // I'll leave it as just redirect for this minimal slice unless I promised explicit update in the plan?
    // Plan: "Manual ... Click 'Open' -> Verify last_opened update & Redirect."
    // Accept Critical: "Clicking Open on a recent project updates last_opened..."
    // Okay, I need to implement this. I will use `GET /api/projects?slug=...` but that's read-only.
    // I will modify `GET /api/projects` to accept `?touch=true&slug=...`? Or just `POST /api/projects/touch`?
    // I'll create a `POST /api/projects/open` endpoint or just doing it in the component is too late.
    // Actually, I can allow `POST /api/projects` with just `{ slug }` to mean "touch"? No, that's create.
    // I will skip the "explicit backend update" for the API route impl previously, I forgot it.
    // I will fix `app/api/projects/route.ts` to support this, OR implement a `PATCH`.
    // Let's stick to the component for now, and I will fix the API route in the next step to support updating `last_opened`.
    // I'll add a `PATCH` method to `/api/projects/route.ts` (or `[slug]/route.ts`).
    // Since I'm in `WelcomePage`, I'll write the logic assuming a `POST /api/projects/open` or similar exists, OR simply:
    // I'll update the API in a moment. Let's assume `POST /api/projects/open` { slug } works.
    
    // For now, I'll write the fetch call.
    await fetch('/api/projects/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
    });
    router.push(`/editor?project=${slug}`);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--accent)]">
          Welcome
        </h1>
        <p className="text-gray-400 mt-2">Story Planner</p>
      </header>

      <section className="flex gap-4 mb-12">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>+</span> Start New Project
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Open Existing Project
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Recent projects</h2>
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-gray-500 italic p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              No recent projects — start one.
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-[var(--card)] rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
              >
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <div className="text-sm text-gray-400 flex gap-4">
                    {p.author && <span>by {p.author}</span>}
                    <span>{p.last_opened ? new Date(p.last_opened).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenProject(p.slug)}
                  className="bg-white/10 text-sm px-4 py-2 rounded hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all opacity-0 group-hover:opacity-100"
                >
                  Open
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Project Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full bg-black/20 border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  className="w-full bg-black/20 border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Creator</label>
                <input
                  type="text"
                  value={modalData.author}
                  onChange={(e) => setModalData({ ...modalData, author: e.target.value })}
                  className="w-full bg-black/20 border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNew}
                disabled={!modalData.name}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
