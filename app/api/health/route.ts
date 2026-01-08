import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    await db.query('SELECT 1');
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('Health check failed', err);
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
  }
}
