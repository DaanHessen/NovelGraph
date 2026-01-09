import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('project_slug');

  if (!slug) {
    return NextResponse.json({ error: 'Project slug required' }, { status: 400 });
  }

  try {
    const res = await db.query(
      'SELECT graph_data FROM projects WHERE slug = $1',
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let data = res.rows[0].graph_data || {};
    
    if (data.nodes && Array.isArray(data.nodes) && !data.pages) {
        const defaultPageId = crypto.randomUUID();
        data = {
            pages: [{
                id: defaultPageId,
                name: 'Story Map',
                nodes: data.nodes,
                edges: data.edges || []
            }],
            activePageId: defaultPageId
        };
    }
    
    if (!data.pages) {
        const defaultPageId = crypto.randomUUID();
        data = {
             pages: [{
                id: defaultPageId,
                name: 'Story Map',
                nodes: [],
                edges: []
            }],
            activePageId: defaultPageId
        };
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to load graph:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('project_slug');

  if (!slug) {
    return NextResponse.json({ error: 'Project slug required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    
    await db.query(
      'UPDATE projects SET graph_data = $1 WHERE slug = $2',
      [JSON.stringify(body), slug]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to save graph:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
