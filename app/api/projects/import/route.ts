import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
    }
    
    const name = body.name || body.title || 'Untitled Project';
    const description = body.description || '';
    const author = body.author || '';

    const id = uuidv4();
    const slug = generateSlug(name);

    const result = await db.query(
      `INSERT INTO projects (id, slug, name, description, author, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, slug, name, description, author, JSON.stringify(body)]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Failed to import project', err);
    return NextResponse.json({ error: 'Invalid JSON or Internal Error' }, { status: 400 });
  }
}
