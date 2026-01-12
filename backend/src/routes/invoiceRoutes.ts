import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController';
import { emailController } from '../controllers/emailController';
import { whatsappController } from '../controllers/whatsappController';

const router = Router();

// Retrieve invoice list
router.get('/', invoiceController.listInvoices);

// Create new invoice
router.post('/', invoiceController.createInvoice);

// Get specific invoice
router.get('/:id', invoiceController.getInvoice);

// Update invoice (client info, globals)
router.put('/:id', invoiceController.updateInvoice);

// Add item to invoice
router.post('/:id/items', invoiceController.addItem);

// Delete item
router.delete('/items/:itemId', invoiceController.deleteItem);

// Update item
router.put('/items/:itemId', invoiceController.updateItem);

// Send Invoice Email
router.post('/:id/send-email', emailController.sendInvoiceEmail);

// Send Invoice WhatsApp
router.post('/:id/send-whatsapp', whatsappController.sendInvoiceWhatsApp);

export default router;
