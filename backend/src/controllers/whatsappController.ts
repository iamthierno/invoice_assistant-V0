
import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { query } from '../db';
import { generateInvoicePdf } from '../services/invoicePdf';
import { config } from '../config';

export const whatsappController = {
    sendInvoiceWhatsApp: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { toPhoneNumber } = req.body; // Expecting format like "22378840892"

            if (!toPhoneNumber) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            if (!config.whatsapp.token || !config.whatsapp.phoneId) {
                return res.status(500).json({ error: 'WhatsApp configuration missing (TOKEN or PHONE_ID)' });
            }

            // 1. Fetch Invoice Data
            const result = await query(`SELECT * FROM get_invoice_with_items($1)`, [id]);
            const invoice = result.rows[0]?.get_invoice_with_items;

            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            // 2. Generate PDF
            const pdfBuffer = await generateInvoicePdf(invoice);

            // 3. Upload PDF to WhatsApp Media Endpoint
            const form = new FormData();
            form.append('file', pdfBuffer, {
                filename: `Devis-${invoice.reference}.pdf`,
                contentType: 'application/pdf',
            });
            form.append('messaging_product', 'whatsapp');

            console.log('Uploading PDF to WhatsApp...');
            const uploadResponse = await axios.post(
                `https://graph.facebook.com/v18.0/${config.whatsapp.phoneId}/media`,
                form,
                {
                    headers: {
                        'Authorization': `Bearer ${config.whatsapp.token}`,
                        ...form.getHeaders(),
                    },
                }
            );

            const mediaId = uploadResponse.data.id;
            console.log('PDF Uploaded. Media ID:', mediaId);

            // 4. Send Message with Document
            console.log(`Sending WhatsApp message to ${toPhoneNumber}...`);
            await axios.post(
                `https://graph.facebook.com/v18.0/${config.whatsapp.phoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: toPhoneNumber,
                    type: 'document',
                    document: {
                        id: mediaId,
                        caption: `Bonjour, voici votre devis ${invoice.reference}.`,
                        filename: `Devis-${invoice.reference}.pdf`
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.whatsapp.token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('WhatsApp message sent successfully');
            res.json({ success: true, message: 'WhatsApp sent successfully' });

        } catch (error: any) {
            console.error('Error sending WhatsApp:', error.response?.data || error.message);
            res.status(500).json({
                error: 'Failed to send WhatsApp',
                details: error.response?.data || error.message
            });
        }
    }
};
