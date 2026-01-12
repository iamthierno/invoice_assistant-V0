export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotalHT: number;
    tax: number;
    discount: number;
    taxType: 'percent' | 'amount';
    discountType: 'percent' | 'amount';
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
    effectiveTax: number;
    effectiveDiscount: number;
}
