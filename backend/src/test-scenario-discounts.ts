import { query } from './db';

const runScenario = async () => {
    try {
        console.log('\n--- SCENARIO: Mixed Item Discounts (10% and 50%) ---');

        // 1. Create Invoice
        const createRes = await query(`SELECT * FROM create_invoice($1, $2, $3)`, [{}, 0, 0]);
        const invoiceId = createRes.rows[0].id;

        // 2. Add Items
        // Item 1: 1000 @ 10% Discount
        // Discount = 100. Net = 900.
        await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`,
            [invoiceId, "Laptop (10% Off)", 1, 1000, 0, 10]);

        // Item 2: 100 @ 50% Discount
        // Discount = 50. Net = 50.
        await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`,
            [invoiceId, "Mouse (50% Off)", 1, 100, 0, 50]);

        // 3. Get Result
        const res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
        const invoice = res.rows[0].get_invoice_with_items;

        // Display RAW JSON
        console.log(JSON.stringify(invoice, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runScenario();
