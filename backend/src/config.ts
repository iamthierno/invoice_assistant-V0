import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
    backend_url: process.env.BACKEND_URL,
    backend_port: process.env.BACKEND_PORT,
    db: {
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE
    },
    jwtSecret: process.env.JWT_SECRET,
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    whatsapp: {
        token: process.env.WHATSAPP_TOKEN,
        phoneId: process.env.WHATSAPP_PHONE_ID
    }
};
