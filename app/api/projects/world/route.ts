import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectSlug = searchParams.get('project_slug');

  if (!projectSlug) {
    return NextResponse.json({ error: 'Project slug is required' }, { status: 400 });
  }

  try {
    const res = await db.query(
      'SELECT world_data FROM projects WHERE slug = $1',
      [projectSlug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0].world_data || {});
  } catch (error) {
    console.error('Failed to fetch world data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_slug, ...worldData } = body;

    if (!project_slug) {
      return NextResponse.json({ error: 'Project slug is required' }, { status: 400 });
    }

    await db.query(
      'UPDATE projects SET world_data = $1 WHERE slug = $2',
      [JSON.stringify(worldData), project_slug]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save world data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
