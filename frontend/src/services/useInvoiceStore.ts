import { create } from 'zustand';
import type { InvoiceItem, ClientInfo, InvoiceTotals } from '../types';
import { apiService } from './api';
import { calculateInvoiceTotals } from '../utils/calculations';

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
    updateItem: (id: string, updates: Partial<InvoiceItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    setClientInfo: (info: Partial<ClientInfo>) => Promise<void>;
    updateGlobalTax: (rate: number) => Promise<void>;
    updateGlobalDiscount: (rate: number) => Promise<void>;
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

        // 1. Flush any pending updates first!
        await get().flushUpdates();

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

    updateItem: async (id, updates) => {
        const { items, globalTax, globalDiscount } = get();
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );

        const newTotals = calculateInvoiceTotals(updatedItems, globalTax, globalDiscount);
        set({ items: updatedItems, totals: newTotals });

        // Queue update
        get().queueUpdate(id, updates);
    },

    // Internal state for debouncing
    _pendingUpdates: {},
    _debounceTimeout: null,

    queueUpdate: (id, updates) => {
        const { _pendingUpdates, _debounceTimeout } = get();

        // Merge updates
        const newPending = {
            ..._pendingUpdates,
            [id]: { ...(_pendingUpdates[id] || {}), ...updates }
        };

        if (_debounceTimeout) clearTimeout(_debounceTimeout);

        const timeout = setTimeout(() => {
            get().flushUpdates();
        }, 1000); // 1s debounce for stability

        set({ _pendingUpdates: newPending, _debounceTimeout: timeout });
    },

    flushUpdates: async () => {
        const { _pendingUpdates, _debounceTimeout, invoiceId } = get();

        if (Object.keys(_pendingUpdates).length === 0) return;

        // Clear timeout and pending immediately to prevent double-flush
        if (_debounceTimeout) clearTimeout(_debounceTimeout);
        set({ _pendingUpdates: {}, _debounceTimeout: null });

        try {
            // Process all pending updates
            const updatePromises = Object.entries(_pendingUpdates).map(([id, updates]) =>
                apiService.updateItem(id, updates as any)
            );

            await Promise.all(updatePromises);

            // After all updates, refresh totals from server to be 100% sure
            if (invoiceId) {
                const fullInvoice = await apiService.getInvoice(invoiceId);
                set({ totals: fullInvoice.totals });
            }
        } catch (error) {
            console.error("Failed to flush updates", error);
        }
    },

    deleteItem: async (itemId) => {
        const { invoiceId } = get();
        if (!invoiceId) return;

        // 1. Flush any pending updates first!
        await get().flushUpdates();

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

        // 1. Flush any pending updates first!
        await get().flushUpdates();

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

        // 1. Flush any pending updates first!
        await get().flushUpdates();

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
