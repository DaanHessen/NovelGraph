import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 50);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const result = await db.query('SELECT * FROM projects WHERE slug = $1', [slug]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    const result = await db.query(
      'SELECT * FROM projects ORDER BY last_opened DESC LIMIT $1',
      [limit]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch projects', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, author } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = uuidv4();
    const slug = generateSlug(name);
    // Ensure slug uniqueness could be retried, but relying on random suffix for now as minimal implementation.

    const result = await db.query(
      `INSERT INTO projects (id, slug, name, description, author)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, slug, name, description || '', author || '']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Failed to create project', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
