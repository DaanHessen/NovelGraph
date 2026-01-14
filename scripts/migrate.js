/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');

const ADJECTIVES = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Brave', 'Quiet', 'Calm', 'Eager', 'Witty', 'Jolly', 'Misty', 'Silent', 'Swift', 'Gentle', 'Wild', 'Noble', 'Bright', 'Cosmic', 'Ancient'];
const NOUNS = ['Badger', 'Fox', 'Owl', 'Panda', 'Tiger', 'Bear', 'Falcon', 'Wolf', 'Hawk', 'Eagle', 'Raven', 'Phoenix', 'Dragon', 'Lynx', 'Stag', 'Otter', 'Crane', 'Viper', 'Cobra'];

function generateName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}

async function migrate() {
  console.log('Starting migration...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        last_opened TIMESTAMP WITH TIME ZONE DEFAULT now(),
        metadata JSONB DEFAULT '{}'
      );
    `);
    console.log('Projects table ensured.');

    await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS graph_data JSONB DEFAULT '{"nodes":[], "edges":[]}';
    `);
    console.log('Graph data column ensured.');

    await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS world_data JSONB DEFAULT '{}';
    `);
    console.log('World data column ensured.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value JSONB
      );
    `);
    console.log('App Settings table ensured.');

    const res = await client.query(`SELECT value FROM app_settings WHERE key = 'user_profile'`);
    if (res.rows.length === 0) {
      const username = generateName();
      const profile = { username, avatar: null };
      await client.query(`
        INSERT INTO app_settings (key, value)
        VALUES ('user_profile', $1)
      `, [JSON.stringify(profile)]);
      console.log(`Seeded user profile: ${username}`);
    } else {
      console.log('User profile already exists.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
