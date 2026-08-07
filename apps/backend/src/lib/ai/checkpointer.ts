import { Pool } from 'pg';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { logger } from '../logger';

const isProduction = process.env.NODE_ENV === 'production';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = parseInt(process.env.PG_PORT || '5432', 10);
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'postgres';
const PG_SSL_CA = process.env.PG_SSL_CA;
const DB_NAME = process.env.DB_NAME || 'lems-local';

let checkpointer: PostgresSaver | null = null;

export const getCheckpointer = (): PostgresSaver => {
  if (!checkpointer) {
    const pool = new Pool({
      host: PG_HOST,
      port: PG_PORT,
      user: PG_USER,
      password: PG_PASSWORD,
      database: DB_NAME,
      ssl: isProduction ? { ca: PG_SSL_CA, rejectUnauthorized: true } : false
    });

    pool.on('error', err => {
      logger.error({ component: 'ai-checkpointer', error: err.message }, 'Checkpointer pool error');
    });

    checkpointer = new PostgresSaver(pool);
  }
  return checkpointer;
};

export const closeCheckpointer = async (): Promise<void> => {
  if (checkpointer) {
    await checkpointer.end();
    checkpointer = null;
    logger.info({ component: 'ai-checkpointer' }, 'Checkpointer connection closed');
  }
};
