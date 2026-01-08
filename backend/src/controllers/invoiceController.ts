import { Request, Response } from 'express';
import { query } from '../db';

export const invoiceController = {
    // 1. Create Invoice
    createInvoice: async (req: Request, res: Response) => {
        try {
            const { clientInfo, globalTax, globalDiscount } = req.body;

            const result = await query(
                `SELECT * FROM create_invoice($1, $2, $3)`,
                [clientInfo, globalTax, globalDiscount]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({ error: 'Failed to create invoice' });
        }
    },

    // 2. Get Invoice
    getInvoice: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await query(
                `SELECT * FROM get_invoice_with_items($1)`,
                [id]
            );

            const invoice = result.rows[0]?.get_invoice_with_items;

            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            res.json(invoice);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            res.status(500).json({ error: 'Failed to fetch invoice' });
        }
    },

    // 3. Add Item
    addItem: async (req: Request, res: Response) => {
        try {
            const { id } = req.params; // Invoice ID
            const { description, quantity, unitPrice, tax, discount } = req.body;

            const result = await query(
                `SELECT * FROM add_invoice_item($1, $2, $3, $4, $5, $6)`,
                [id, description, quantity, unitPrice, tax, discount]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding item:', error);
            res.status(500).json({ error: 'Failed to add item' });
        }
    },

    // 4. Update Invoice (Client Info or Globals)
    updateInvoice: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { clientInfo, globalTax, globalDiscount } = req.body;

            const result = await query(
                `SELECT * FROM update_invoice($1, $2, $3, $4)`,
                [id, clientInfo, globalTax, globalDiscount]
            );

            res.json(result.rows[0]?.update_invoice);
        } catch (error) {
            console.error('Error updating invoice:', error);
            res.status(500).json({ error: 'Failed to update invoice' });
        }
    },

    // 5. Delete Item
    deleteItem: async (req: Request, res: Response) => {
        try {
            const { itemId } = req.params;
            await query(`SELECT * FROM delete_invoice_item($1)`, [itemId]);
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).json({ error: 'Failed to delete item' });
        }
    },

    // 6. Update Item
    updateItem: async (req: Request, res: Response) => {
        try {
            const { itemId } = req.params;
            const { description, quantity, unitPrice, tax, discount } = req.body;

            const result = await query(
                `SELECT * FROM update_invoice_item($1, $2, $3, $4, $5, $6)`,
                [itemId, description, quantity, unitPrice, tax, discount]
            );

            res.json(result.rows[0]?.update_invoice_item);
        } catch (error) {
            console.error('Error updating item:', error);
            res.status(500).json({ error: 'Failed to update item' });
        }
    },

    // 7. List Invoices
    listInvoices: async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await query(
                `SELECT * FROM list_invoices($1, $2)`,
                [limit, offset]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error listing invoices:', error);
            res.status(500).json({ error: 'Failed to list invoices' });
        }
    }
};
