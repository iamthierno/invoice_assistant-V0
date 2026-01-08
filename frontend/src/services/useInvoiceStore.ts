import { create } from 'zustand';
import type { InvoiceItem, ClientInfo, InvoiceTotals } from '../types';
import { apiService } from './api';

interface InvoiceStore {
    // State
    invoiceId: string | null;
    reference: string | null;
    items: InvoiceItem[];
    clientInfo: ClientInfo;
    globalTax: number;
    globalDiscount: number;
    totals: InvoiceTotals;
    status: string;
    isSyncing: boolean;

    // Actions
    initializeInvoice: () => Promise<void>;
    addItem: (item: Omit<InvoiceItem, 'id'>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    setClientInfo: (info: Partial<ClientInfo>) => Promise<void>;
    updateGlobalTax: (rate: number) => Promise<void>;
    updateGlobalDiscount: (rate: number) => Promise<void>;
    reset: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
    invoiceId: null,
    reference: null,
    items: [],
    clientInfo: { name: '', address: '', phone: '' },
    globalTax: 0,
    globalDiscount: 0,
    totals: {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        total: 0
    },
    status: 'draft',
    isSyncing: false,

    initializeInvoice: async () => {
        // If we already have an ID, fetch it. If not, create one.
        // For simplicity in this session, we create a new one on load if null.
        if (get().invoiceId) return;

        set({ isSyncing: true });
        try {
            const newInvoice = await apiService.createInvoice({ name: '', phone: '' }, 0, 0);
            // newInvoice contains only columns. Use defaults or fetch?
            // createInvoice returns: id, reference, client_info, etc.
            set({
                invoiceId: newInvoice.id,
                reference: newInvoice.reference,
                clientInfo: newInvoice.client_info,
                globalTax: Number(newInvoice.global_tax_rate),
                globalDiscount: Number(newInvoice.global_discount_rate),
                // Totals are 0 initially
            });
        } catch (error) {
            console.error("Failed to init invoice", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    addItem: async (item) => {
        let { invoiceId } = get();
        set({ isSyncing: true });

        try {
            if (!invoiceId) {
                // Should have been initialized, but just in case
                await get().initializeInvoice();
                invoiceId = get().invoiceId;
            }

            if (!invoiceId) throw new Error("No invoice ID");

            // 1. Add Item
            // Note: backend expects 'tax' and 'discount' keys. Frontend uses same.
            await apiService.addItem(invoiceId, item);

            // 2. Fetch updated invoice (to get new calculations)
            const fullInvoice = await apiService.getInvoice(invoiceId);

            set({
                items: fullInvoice.items,
                totals: fullInvoice.totals,
                // Update others just in case
                globalTax: Number(fullInvoice.globalTax),
                globalDiscount: Number(fullInvoice.globalDiscount)
            });

        } catch (error) {
            console.error("Failed to add item", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    deleteItem: async (itemId) => {
        const { invoiceId } = get();
        if (!invoiceId) return;
        set({ isSyncing: true });

        try {
            await apiService.deleteItem(itemId);
            const fullInvoice = await apiService.getInvoice(invoiceId);
            set({
                items: fullInvoice.items,
                totals: fullInvoice.totals
            });
        } catch (error) {
            console.error("Failed to delete item", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    setClientInfo: async (info) => {
        const { invoiceId, clientInfo } = get();
        if (!invoiceId) return;
        // We defer update? No, let's sync efficiently.
        // Merging info
        const newInfo = { ...clientInfo, ...info };

        // Optimistic update
        set({ clientInfo: newInfo });

        // Debouncing logic should technically be in component, but here we just call API
        try {
            await apiService.updateInvoice(invoiceId, { clientInfo: newInfo });
            // No strict need to re-fetch totals if client info doesn't affect math
        } catch (error) {
            console.error("Failed to update client info", error);
        }
    },

    updateGlobalTax: async (rate) => {
        const { invoiceId } = get();
        if (!invoiceId) return;
        set({ isSyncing: true });

        try {
            const fullInvoice = await apiService.updateInvoice(invoiceId, { globalTax: rate });
            set({
                globalTax: Number(fullInvoice.globalTax),
                // items shouldn't change, but totals will
                totals: fullInvoice.totals
            });
        } catch (error) {
            console.error("Failed to update global tax", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    updateGlobalDiscount: async (rate) => {
        const { invoiceId } = get();
        if (!invoiceId) return;
        set({ isSyncing: true });

        try {
            const fullInvoice = await apiService.updateInvoice(invoiceId, { globalDiscount: rate });
            set({
                globalDiscount: Number(fullInvoice.globalDiscount),
                totals: fullInvoice.totals
            });
        } catch (error) {
            console.error("Failed to update global discount", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    reset: () => {
        set({ invoiceId: null, items: [], totals: { subtotal: 0, discountTotal: 0, taxTotal: 0, total: 0 } });
    }
}));
