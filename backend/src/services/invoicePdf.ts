
import PDFDocument from 'pdfkit';

export const generateInvoicePdf = (invoice: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // --- Colors & Fonts ---
            const COLOR_PRIMARY = '#2563EB'; // Blue-600
            const COLOR_DARK = '#0F172A';    // Slate-900
            const COLOR_GRAY = '#64748B';    // Slate-500
            const COLOR_LIGHT_GRAY = '#F1F5F9'; // Slate-100

            // --- Header ---
            // Company Name (Left)
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .fillColor(COLOR_DARK)
                .text('ARTISAN PRO SERVICES', 50, 50)
                .font('Helvetica')
                .fontSize(10)
                .fillColor(COLOR_GRAY)
                .text('Prestation de Services', 50, 68);

            // DEVIS Label (Right)
            // Blue accent line
            doc
                .rect(450, 45, 50, 3)
                .fill(COLOR_PRIMARY);

            doc
                .font('Helvetica-BoldOblique') // Italic Bold
                .fontSize(24)
                .fillColor(COLOR_DARK)
                .text('DEVIS', 450, 60, { width: 100, align: 'right' }); // Align right relative to x=450? No, width 100 starting at 450 ends at 550. Page width is ~595. 

            // Actually, let's align correctly to the right margin (approx 545)
            doc
                .text('DEVIS', 0, 60, { align: 'right', indent: 0, width: 545 });

            doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor(COLOR_GRAY)
                .text(invoice.reference || '#DV-2026-XXXX', 0, 88, { align: 'right', width: 545 });

            // --- Client Info & Date ---
            const clientY = 130;

            // Date (Right)
            const dateStr = new Date(invoice.createdAt || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            doc
                .font('Helvetica-BoldOblique')
                .fontSize(10)
                .fillColor(COLOR_DARK)
                .text(dateStr, 0, clientY + 10, { align: 'right', width: 545 });

            // Client Box (Simulated with rounded rect or just lines)
            // Name
            doc.roundedRect(50, clientY, 250, 35, 5).strokeColor(COLOR_LIGHT_GRAY).stroke();
            doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor(COLOR_DARK)
                .text(invoice.clientInfo?.name || 'Nom du client', 65, clientY + 12);

            // Phone
            doc.roundedRect(310, clientY, 150, 35, 5).strokeColor(COLOR_LIGHT_GRAY).stroke();
            doc
                .text(invoice.clientInfo?.phone || 'Téléphone', 325, clientY + 12);


            // --- Table Header ---
            const tableTop = 200;
            doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_DARK);

            doc.text('DÉSIGNATION', 50, tableTop);
            doc.text('QTÉ', 300, tableTop, { width: 40, align: 'center' });
            doc.text('PU (XOF)', 350, tableTop, { width: 80, align: 'right' });
            doc.text('MONTANT HT (XOF)', 440, tableTop, { width: 100, align: 'right' });

            // Line below header
            doc
                .moveTo(50, tableTop + 15)
                .lineTo(545, tableTop + 15)
                .strokeColor(COLOR_DARK)
                .lineWidth(1)
                .stroke();

            // --- Table Items ---
            let y = tableTop + 30;
            doc.font('Helvetica').fontSize(10).fillColor(COLOR_DARK);

            invoice.items.forEach((item: any) => {
                // Background for row (optional, maybe just spacing)
                // doc.roundedRect(50, y - 5, 495, 25, 4).fillColor('#FAFAFA').fill();
                // doc.fillColor(COLOR_DARK);

                doc.text(item.description, 60, y);
                doc.text(item.quantity.toString(), 300, y, { width: 40, align: 'center' });
                doc.text(formatCurrency(item.unitPrice), 350, y, { width: 80, align: 'right' });
                doc.text(formatCurrency(item.subtotalHT), 440, y, { width: 100, align: 'right' });

                y += 30;
            });

            // --- Totals ---
            const totalsY = y + 20;

            doc.font('Helvetica').fontSize(10).fillColor(COLOR_GRAY);
            doc.text('Total HT', 350, totalsY, { width: 100, align: 'right' });
            doc.fillColor(COLOR_DARK).text(formatCurrency(invoice.totals.subtotal), 460, totalsY, { width: 80, align: 'right' });

            doc.fillColor(COLOR_GRAY).text(`Remise`, 350, totalsY + 20, { width: 100, align: 'right' });
            doc.fillColor('#EF4444').text(formatCurrency(invoice.totals.discountTotal), 460, totalsY + 20, { width: 80, align: 'right' }); // Red for discount

            doc.fillColor(COLOR_GRAY).text(`TVA`, 350, totalsY + 40, { width: 100, align: 'right' });
            doc.fillColor(COLOR_DARK).text(formatCurrency(invoice.totals.taxTotal), 460, totalsY + 40, { width: 80, align: 'right' });

            // Total TTC
            doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_DARK);
            doc.text('TOTAL TTC', 350, totalsY + 70, { width: 100, align: 'right' });
            doc.text(formatCurrency(invoice.totals.total) + ' XOF', 460, totalsY + 70, { width: 80, align: 'right' });


            // --- Footer ---
            const footerY = 700;

            // Line
            doc
                .moveTo(50, footerY)
                .lineTo(545, footerY)
                .strokeColor(COLOR_LIGHT_GRAY)
                .lineWidth(1)
                .stroke();

            doc.fontSize(8).fillColor(COLOR_GRAY);

            // Col 1: Payment Info
            doc.font('Helvetica-Bold').text('INFOS SUR LE PAIEMENT', 50, footerY + 15);
            doc.font('Helvetica').text('Banque: UNITED BANK OF AFRICA UBA', 50, footerY + 30);
            doc.text('Numero de compte: 12345678901', 50, footerY + 45);

            // Col 2: Address
            doc.text('Adresse: Plateau, Bamako près de la gare', 250, footerY + 30);
            doc.text('RCCM: Ma.Bko.2024.B.10122 Du 31/10/2024|NIF: 087100080E', 250, footerY + 45);

            // Col 3: Contact
            doc.text('Numéro: +223 27 22 00 00', 450, footerY + 30);
            doc.text('Email: contact@artisansproservices.com', 450, footerY + 45);

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

function formatCurrency(amount: number) {
    // Simple formatter with space separator
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
