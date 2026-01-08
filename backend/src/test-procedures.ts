import { query } from './db';

const runCase1 = async () => {
    console.log('\n--- CASE 1: Item Modifiers Only (Global 0) ---');
    // 1. Create Invoice (No Globals)
    const createRes = await query(`SELECT * FROM create_invoice($1, $2, $3)`, [{}, 0, 0]);
    const invoiceId = createRes.rows[0].id;
    console.log(`Invoice ${createRes.rows[0].reference} created.`);

    // 2. Add Items
    // Item 1: Standard (100k)
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4)`, [invoiceId, "Item 1", 1, 100000]);
    // Item 2: Discount 10% (50k)
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`, [invoiceId, "Item 2", 1, 50000, 0, 10]);
    // Item 3: Tax 18% (20k)
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`, [invoiceId, "Item 3", 1, 20000, 18, 0]);

    // 3. Result (Calculation is auto in add_item now? Yes, calling procedure inside)
    const res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
    console.log('Totals:', JSON.stringify(res.rows[0].get_invoice_with_items.totals, null, 2));
};

const runCase2 = async () => {
    console.log('\n--- CASE 2: Items + Global Tax & Discount ---');
    // 1. Create Invoice (No Globals initially)
    const createRes = await query(`SELECT * FROM create_invoice($1, $2, $3)`, [{}, 0, 0]);
    const invoiceId = createRes.rows[0].id;

    // 2. Add Same Items
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4)`, [invoiceId, "Item 1", 1, 100000]);
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`, [invoiceId, "Item 2", 1, 50000, 0, 10]);
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`, [invoiceId, "Item 3", 1, 20000, 18, 0]);

    // 3. Apply Global Tax (18%) and Discount (5%)
    console.log('Applying Global Tax 18% and Discount 5%...');
    await query(`SELECT * FROM update_invoice($1, $2, $3, $4)`, [invoiceId, null, 18, 5]);

    // 5. Result
    const res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
    console.log('Totals:', JSON.stringify(res.rows[0].get_invoice_with_items.totals, null, 2));
};

const runCase3 = async () => {
    console.log('\n--- CASE 3: Item Tax + Global Tax Update (Interaction) ---');
    // 1. Create Invoice
    const createRes = await query(`SELECT * FROM create_invoice($1, $2, $3)`, [{}, 0, 0]);
    const invoiceId = createRes.rows[0].id;

    // 2. Add Items
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4)`, [invoiceId, "Standard", 1, 100000]);
    await query(`SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`, [invoiceId, "Taxed Item (18%)", 1, 20000, 18, 0]);

    // 3. Initial Check
    let res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
    console.log('Step A (Item Tax Only) TotalTax:', res.rows[0].get_invoice_with_items.totals.totalTax);

    // 4. Update to add Global Tax 18%
    console.log('Updating invoice to add Global Tax 18%...');
    await query(`SELECT * FROM update_invoice($1, $2, $3, $4)`, [invoiceId, null, 18, 0]);

    // 5. Result
    res = await query(`SELECT * FROM get_invoice_with_items($1)`, [invoiceId]);
    console.log('Totals:', JSON.stringify(res.rows[0].get_invoice_with_items.totals, null, 2));
};

const runTests = async () => {
    try {
        await runCase1();
        await runCase2();
        await runCase3();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTests();
