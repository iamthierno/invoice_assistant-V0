import { query } from '../db';

const verifyDatabase = async () => {
    try {
        console.log('--- Verifying Database Schema ---');

        // Check Tables
        const tablesRes = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('\nTables found:', tablesRes.rows.map(r => r.table_name));

        // Check Invoices Columns
        const columnsRes = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'invoices';
        `);
        console.log('\nInvoices Columns:', columnsRes.rows.map(r => `${r.column_name} (${r.data_type})`));

        // Check Procedures/Functions
        const functionsRes = await query(`
            SELECT routines.routine_name
            FROM information_schema.routines
            WHERE routines.specific_schema = 'public'
            ORDER BY routines.routine_name;
        `);
        console.log('\nFunctions found:', functionsRes.rows.map(r => r.routine_name));

        console.log('\n--- Verification Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verifyDatabase();
