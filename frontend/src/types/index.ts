export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    discount: number;
}

export interface ClientInfo {
    name: string;
    phone: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface InvoiceTotals {
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
}
