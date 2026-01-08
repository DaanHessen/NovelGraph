import db from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ project: string }>;
}) {
  const { project: slug } = await searchParams;

  if (!slug) {
    return <div>Project slug missing.</div>;
  }

  const result = await db.query('SELECT name FROM projects WHERE slug = $1', [slug]);
  const project = result.rows[0];

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-accent mb-4">{project.name}</h1>
      <p className="text-gray-400">Editor placeholder for project: {slug}</p>
    </div>
  );
}
