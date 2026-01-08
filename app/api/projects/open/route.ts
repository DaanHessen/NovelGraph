import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE projects SET last_opened = now() WHERE slug = $1 RETURNING *',
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to open project', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
