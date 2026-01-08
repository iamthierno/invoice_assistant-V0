import { Pool } from 'pg';
import { config } from './config';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    database: config.db.database
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
    try {
        const sqlPath = path.join(__dirname, 'models', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Loading schema from ${sqlPath}...`);
        await pool.query(sql);
        console.log('Database initialized successfully: Tables and Procedures ready.');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
};

export default pool;
