import { create } from 'zustand';
import type { InvoiceItem, ClientInfo, InvoiceTotals } from '../types';
import { apiService } from './api';
import { calculateInvoiceTotals, enrichTotals } from '../utils/calculations';

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
    showSuccess: boolean;

    // Actions
    initializeInvoice: () => Promise<void>;
    addItem: (item: Omit<InvoiceItem, 'id' | 'subtotalHT'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<InvoiceItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    setClientInfo: (info: Partial<ClientInfo>) => Promise<void>;
    updateGlobalTax: (rate: number) => Promise<void>;
    updateGlobalDiscount: (rate: number) => Promise<void>;
    saveInvoice: () => Promise<void>;
    reset: () => void;

    // Internal/Utility
    flushUpdates: () => Promise<void>;
    queueUpdate: (id: string, updates: any) => void;
    _pendingUpdates: Record<string, any>;
    _debounceTimeout: any;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
    invoiceId: null,
    reference: null,
    items: [],
    clientInfo: { name: '', phone: '' },
    globalTax: 0,
    globalDiscount: 0,
    totals: {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        total: 0,
        effectiveTax: 0,
        effectiveDiscount: 0
    },
    status: 'draft',
    isSyncing: false,
    showSuccess: false,

    initializeInvoice: async () => {
        if (get().invoiceId) return;

        set({ isSyncing: true });
        try {
            const newInvoice = await apiService.createInvoice({ name: '', phone: '' }, 0, 0);
            set({
                invoiceId: newInvoice.id,
                reference: newInvoice.reference,
                clientInfo: newInvoice.client_info,
                globalTax: Number(newInvoice.global_tax_rate),
                globalDiscount: Number(newInvoice.global_discount_rate),
            });
        } catch (error) {
            console.error("Failed to init invoice", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    addItem: async (item) => {
        let { invoiceId } = get();
        await get().flushUpdates();
        set({ isSyncing: true });

        try {
            if (!invoiceId) {
                await get().initializeInvoice();
                invoiceId = get().invoiceId;
            }
            if (!invoiceId) throw new Error("No invoice ID");

            // Ensure default taxType and discountType for new items
            const itemWithDefaults = {
                ...item,
                taxType: item.taxType || 'percent',
                discountType: item.discountType || 'percent',
            };

            await apiService.addItem(invoiceId, itemWithDefaults);
            const fullInvoice = await apiService.getInvoice(invoiceId);

            set({
                items: fullInvoice.items,
                totals: enrichTotals(fullInvoice.totals),
                globalTax: Number(fullInvoice.globalTax),
                globalDiscount: Number(fullInvoice.globalDiscount)
            });
        } catch (error: any) {
            console.error("Failed to add item", error);
            // If the error is a foreign key violation (invoice deleted), reset and retry
            if (error.message?.includes('23503') || error.response?.status === 404) {
                console.log("Invoice missing, re-initializing...");
                set({ invoiceId: null });
                await get().addItem(item);
            }
        } finally {
            set({ isSyncing: false });
        }
    },

    updateItem: async (id, updates) => {
        const { items, globalTax, globalDiscount } = get();
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );

        const newTotals = calculateInvoiceTotals(updatedItems, globalTax, globalDiscount);
        set({ items: updatedItems, totals: newTotals });
        get().queueUpdate(id, updates);
    },

    _pendingUpdates: {},
    _debounceTimeout: null,

    queueUpdate: (id, updates) => {
        const { _pendingUpdates, _debounceTimeout } = get();
        const newPending = {
            ..._pendingUpdates,
            [id]: { ...(_pendingUpdates[id] || {}), ...updates }
        };

        if (_debounceTimeout) clearTimeout(_debounceTimeout);
        const timeout = setTimeout(() => {
            get().flushUpdates();
        }, 1000);

        set({ _pendingUpdates: newPending, _debounceTimeout: timeout });
    },

    flushUpdates: async () => {
        const { _pendingUpdates, _debounceTimeout, invoiceId } = get();
        if (Object.keys(_pendingUpdates).length === 0) return;

        if (_debounceTimeout) clearTimeout(_debounceTimeout);
        set({ _pendingUpdates: {}, _debounceTimeout: null });

        try {
            const updatePromises = Object.entries(_pendingUpdates).map(([id, updates]) =>
                apiService.updateItem(id, updates as any)
            );
            await Promise.all(updatePromises);

            if (invoiceId) {
                const fullInvoice = await apiService.getInvoice(invoiceId);
                set({ totals: enrichTotals(fullInvoice.totals) });
            }
        } catch (error) {
            console.error("Failed to flush updates", error);
        }
    },

    deleteItem: async (itemId) => {
        const { invoiceId } = get();
        if (!invoiceId) return;
        await get().flushUpdates();
        set({ isSyncing: true });
        try {
            await apiService.deleteItem(itemId);
            const fullInvoice = await apiService.getInvoice(invoiceId);
            set({
                items: fullInvoice.items,
                totals: enrichTotals(fullInvoice.totals)
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
        const newInfo = { ...clientInfo, ...info };
        set({ clientInfo: newInfo });
        try {
            await apiService.updateInvoice(invoiceId, { clientInfo: newInfo });
        } catch (error) {
            console.error("Failed to update client info", error);
        }
    },

    updateGlobalTax: async (rate) => {
        const { invoiceId } = get();
        if (!invoiceId) return;
        await get().flushUpdates();
        set({ isSyncing: true });
        try {
            const fullInvoice = await apiService.updateInvoice(invoiceId, { globalTax: rate });
            set({
                globalTax: Number(fullInvoice.globalTax),
                totals: enrichTotals(fullInvoice.totals)
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
        await get().flushUpdates();
        set({ isSyncing: true });
        try {
            const fullInvoice = await apiService.updateInvoice(invoiceId, { globalDiscount: rate });
            set({
                globalDiscount: Number(fullInvoice.globalDiscount),
                totals: enrichTotals(fullInvoice.totals)
            });
        } catch (error) {
            console.error("Failed to update global discount", error);
        } finally {
            set({ isSyncing: false });
        }
    },

    saveInvoice: async () => {
        const { invoiceId } = get();
        if (!invoiceId) return;

        await get().flushUpdates();
        set({ isSyncing: true });

        try {
            // Here we could update status to 'sent' or 'saved' if the backend supported it
            // For now, we just consider it done and move to the next one

            // Show success message
            set({ showSuccess: true });

            // Wait a bit to show the success state before resetting
            await new Promise(resolve => setTimeout(resolve, 2000));

            get().reset();
            await get().initializeInvoice();
        } catch (error) {
            console.error("Failed to save invoice", error);
        } finally {
            set({ isSyncing: false, showSuccess: false });
        }
    },

    reset: () => {
        set({
            invoiceId: null,
            items: [],
            totals: {
                subtotal: 0,
                discountTotal: 0,
                taxTotal: 0,
                total: 0,
                effectiveTax: 0,
                effectiveDiscount: 0
            },
            clientInfo: { name: '', phone: '' },
            globalTax: 0,
            globalDiscount: 0,
            reference: null
        });
    }
}));
