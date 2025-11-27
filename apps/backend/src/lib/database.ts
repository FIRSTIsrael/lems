import { Database } from '@lems/database';

const database = new Database();
database.connect();

export default database;
