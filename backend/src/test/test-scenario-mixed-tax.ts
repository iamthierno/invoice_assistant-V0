import { query } from '../db';

const runScenario = async () => {
    try {
        console.log('\n--- SCENARIO: Mixed Item Taxes (10% and 5%) RAW OUTPUT ---');

        // 1. Create Invoice
        const createRes = await query(`SELECT * FROM create_invoice($1, $2, $3)`, [{}, 0, 0]);
        const invoiceId = createRes.rows[0].id;

        // 2. Add Items
        await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`,
            [invoiceId, "Item A (10% Tax)", 1, 1000, 10, 0]);

        await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`,
            [invoiceId, "Item B (5% Tax)", 1, 2000, 5, 0]);

        // 3. Get Result
        const res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
        const invoice = res.rows[0].get_invoice_with_items;

        // Display RAW JSON from Database
        console.log(JSON.stringify(invoice, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runScenario();
