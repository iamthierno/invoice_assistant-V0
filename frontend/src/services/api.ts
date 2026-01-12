import axios from 'axios';
import { config } from '../config';
import type { InvoiceItem, ClientInfo } from '../types';

export const apiService = {
    // Create a new empty invoice
    async createInvoice(clientInfo: ClientInfo = { name: '', phone: '' }, globalTax = 0, globalDiscount = 0) {
        const response = await axios.post(`${config.apiUrl}/api/invoices`, {
            clientInfo,
            globalTax,
            globalDiscount
        });
        return response.data; // Returns basic invoice info (id, ref)
    },

    // Get full invoice with items and totals
    async getInvoice(id: string) {
        const response = await axios.get(`${config.apiUrl}/api/invoices/${id}`);
        return response.data;
    },

    // Add an item to the invoice
    async addItem(invoiceId: string, item: { description: string; quantity: number; unitPrice: number; tax: number; discount: number }) {
        const response = await axios.post(`${config.apiUrl}/api/invoices/${invoiceId}/items`, item);
        return response.data;
    },

    // Delete an item
    async deleteItem(itemId: string) {
        const response = await axios.delete(`${config.apiUrl}/api/invoices/items/${itemId}`);
        return response.data;
    },

    // Update an item
    async updateItem(itemId: string, item: Partial<{ description: string; quantity: number; unitPrice: number; tax: number; discount: number }>) {
        const response = await axios.put(`${config.apiUrl}/api/invoices/items/${itemId}`, item);
        return response.data;
    },

    // Update Global fields (Tax, Discount, Client)
    async updateInvoice(invoiceId: string, data: { clientInfo?: ClientInfo; globalTax?: number; globalDiscount?: number }) {
        const response = await axios.put(`${config.apiUrl}/api/invoices/${invoiceId}`, data);
        return response.data; // Returns FULL invoice object
    },

    async listUserDevis() {
        const response = await axios.get(`${config.apiUrl}/api/invoices`);
        return response.data;
    },

    async sendEmail(invoiceId: string, toEmail: string) {
        const response = await axios.post(`${config.apiUrl}/api/invoices/${invoiceId}/send-email`, { toEmail });
        return response.data;
    },

    async sendWhatsApp(invoiceId: string, toPhoneNumber: string) {
        const response = await axios.post(`${config.apiUrl}/api/invoices/${invoiceId}/send-whatsapp`, { toPhoneNumber });
        return response.data;
    }
};
