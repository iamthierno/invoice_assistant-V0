
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { query } from '../db';
import { generateInvoicePdf } from '../services/invoicePdf';
import { config } from '../config';

// Configure Transporter (using environment variables or defaults)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

console.log(`Email Service Configured for user: ${config.email.user}`);

export const emailController = {
    sendInvoiceEmail: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { toEmail } = req.body;

            if (!toEmail) {
                return res.status(400).json({ error: 'Recipient email is required' });
            }

            // 1. Fetch Invoice Data
            console.log(`Fetching invoice ${id}...`);
            const result = await query(`SELECT * FROM get_invoice_with_items($1)`, [id]);
            const invoice = result.rows[0]?.get_invoice_with_items;

            if (!invoice) {
                console.error(`Invoice ${id} not found`);
                return res.status(404).json({ error: 'Invoice not found' });
            }
            console.log('Invoice data fetched:', JSON.stringify(invoice, null, 2));

            // 2. Generate PDF using the service
            console.log('Generating PDF...');
            const pdfBuffer = await generateInvoicePdf(invoice);
            console.log('PDF generated successfully, buffer size:', pdfBuffer.length);

            // 3. Send Email
            console.log(`Sending email to ${toEmail}...`);
            const mailOptions = {
                from: config.email.user || 'noreply@assistant-invoice.com',
                to: toEmail,
                subject: `Votre Devis ${invoice.reference}`,
                text: `Bonjour,\n\nVeuillez trouver ci-joint votre devis ${invoice.reference}.\n\nCordialement,\nVotre Assistant Devis`,
                attachments: [
                    {
                        filename: `Devis-${invoice.reference}.pdf`,
                        content: pdfBuffer
                    }
                ]
            };

            // Only send if credentials are set, otherwise mock success for dev
            if (config.email.user && config.email.pass) {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${toEmail}`);
            } else {
                console.log('Mock Email Sent:', mailOptions);
                console.log('To configure real email, set EMAIL_USER and EMAIL_PASS in .env');
            }

            res.json({ success: true, message: 'Email sent successfully' });

        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    }
};
