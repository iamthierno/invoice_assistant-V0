import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
    url: process.env.URL,
    port: process.env.PORT,
    db: {
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE
    },
    redis: {
        url: process.env.REDIS_URL
    },
    jwtSecret: process.env.JWT_SECRET,
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};
