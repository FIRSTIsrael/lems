import { Pool } from 'pg';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { KyselyDatabaseSchema } from '../schema/kysely';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432');
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const PG_DATABASE = process.env.PG_DATABASE || 'lems-local';

async function fixFaqCreatedBy() {
  const pool = new Pool({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE
  });

  const db = new Kysely<KyselyDatabaseSchema>({
    dialect: new PostgresDialect({ pool })
  });
  
  try {
    
    // Check if column exists
    const columnCheck = await sql<{ column_name: string }>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'faqs' AND column_name = 'created_by'
    `.execute(db);
    
    if (columnCheck.rows.length > 0) {
      await db.destroy();
      return;
    }
    
    
    // Add column as nullable
    await sql`ALTER TABLE faqs ADD COLUMN created_by uuid`.execute(db);
    
    // Get first admin
    const firstAdmin = await db
      .selectFrom('admins')
      .select('id')
      .orderBy('created_at', 'asc')
      .executeTakeFirst();
    
    if (firstAdmin) {
      
      // Update existing FAQs
      await db
        .updateTable('faqs')
        .set({ created_by: firstAdmin.id })
        .where('created_by', 'is', null)
        .execute();
    }
    
    // Make column NOT NULL
    await sql`ALTER TABLE faqs ALTER COLUMN created_by SET NOT NULL`.execute(db);
    
    // Add foreign key
    await sql`
      ALTER TABLE faqs 
      ADD CONSTRAINT fk_faqs_created_by 
      FOREIGN KEY (created_by) REFERENCES admins(id) 
      ON DELETE RESTRICT
    `.execute(db);
    
    // Add index
    await sql`CREATE INDEX idx_faqs_created_by ON faqs(created_by)`.execute(db);
  } finally {
    await db.destroy();
  }
}

fixFaqCreatedBy();
