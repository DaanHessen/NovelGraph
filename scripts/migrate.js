const { Client } = require('pg');

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
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
