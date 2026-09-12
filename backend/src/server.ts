import express from 'express';
// Trigger restart for SQL update - Try 7 (Align Keys)
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config';
import { initDb } from './db';
import invoiceRoutes from './routes/invoiceRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/invoices', invoiceRoutes);

// Basic Health Check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Assistant Invoice Backend' });
});

// Start Server
const startServer = async () => {
    try {
        await initDb();
        app.listen(config.backend_port, () => {
            console.log(`Backend server running on ${config.backend_url}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
