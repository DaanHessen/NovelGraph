import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const res = await db.query("SELECT value FROM app_settings WHERE key = 'user_profile'");
    if (res.rows.length === 0) {
      return NextResponse.json({ username: 'Writer', avatar: null });
    }
    return NextResponse.json(res.rows[0].value);
  } catch (err) {
    console.error('Failed to fetch profile', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, avatar } = body;

    if (!username || username.trim().length === 0) {
         return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 });
    }

    const profile = { username: username.trim(), avatar };

    await db.query(`
      INSERT INTO app_settings (key, value)
      VALUES ('user_profile', $1)
      ON CONFLICT (key) DO UPDATE
      SET value = $1
    `, [JSON.stringify(profile)]);

    return NextResponse.json(profile);
  } catch (err) {
    console.error('Failed to update profile', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
