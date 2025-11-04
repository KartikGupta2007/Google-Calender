import { sql } from 'drizzle-orm';
import { db } from '../db/drizzle';

async function migrateSchema() {
  console.log('Migrating schema...');

  try {
    // Drop tables in order (drop dependent tables first)
    console.log('Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS attachments CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS events CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS calendars CASCADE`);

    // Create calendars table
    console.log('Creating calendars table...');
    await db.execute(sql`
      CREATE TABLE calendars (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        is_visible BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create events table with all required columns
    console.log('Creating events table...');
    await db.execute(sql`
      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location TEXT DEFAULT '',
        attendees TEXT DEFAULT '[]',
        event_type VARCHAR(50) DEFAULT 'event',
        calendar_id INTEGER REFERENCES calendars(id),
        is_all_day BOOLEAN DEFAULT false,
        conference_link TEXT DEFAULT '',
        reminders TEXT DEFAULT '[]',
        color TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        date TIMESTAMP
      )
    `);

    // Create attachments table
    console.log('Creating attachments table...');
    await db.execute(sql`
      CREATE TABLE attachments (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Schema migration completed successfully!');
  } catch (error) {
    console.error('Error migrating schema:', error);
    throw error;
  }
}

migrateSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
