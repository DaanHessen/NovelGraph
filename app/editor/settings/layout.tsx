'use client';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen bg-[#0a0a0a] overflow-y-auto">
      {/* Content Area - No Sidebar */}
      <div className="max-w-4xl mx-auto py-10 px-12">
          {children}
      </div>
    </div>
  );
}
