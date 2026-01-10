
import { initDb } from './db';
import pool from './db';

const run = async () => {
    try {
        console.log('Starting database re-initialization...');
        await initDb();
        console.log('Database re-initialized successfully.');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Failed to re-initialize database:', error);
        process.exit(1);
    }
};

run();
