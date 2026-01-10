import type { InvoiceItem, InvoiceTotals } from '../types';

/**
 * Calcule les totaux pour un article individuel.
 */
export const calculateItemTotals = (item: InvoiceItem) => {
  const subtotalHT = item.quantity * item.unitPrice;

  // Calcul de la remise
  const itemDiscountAmount = item.discountType === 'amount'
    ? item.discount
    : subtotalHT * (item.discount / 100);

  const afterItemDiscount = subtotalHT - itemDiscountAmount;

  // Calcul de la taxe
  const itemTaxAmount = item.taxType === 'amount'
    ? item.tax
    : afterItemDiscount * (item.tax / 100);

  const totalTTC = afterItemDiscount + itemTaxAmount;

  return {
    subtotalHT,
    itemDiscountAmount,
    itemTaxAmount,
    totalTTC
  };
};

/**
 * Calcule les pourcentages effectifs à partir des montants totaux.
 */
export const enrichTotals = (totals: Omit<InvoiceTotals, 'effectiveTax' | 'effectiveDiscount'>): InvoiceTotals => {
  const effectiveDiscount = totals.subtotal > 0
    ? Number(((totals.discountTotal / totals.subtotal) * 100).toFixed(2))
    : 0;

  const baseForTax = totals.subtotal - totals.discountTotal;
  const effectiveTax = baseForTax > 0
    ? Number(((totals.taxTotal / baseForTax) * 100).toFixed(2))
    : 0;

  return {
    ...totals,
    effectiveTax,
    effectiveDiscount
  };
};

/**
 * Calcule les totaux d'un devis en prenant en compte les taxes/remises par article
 * ET les taux globaux.
 */
export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  globalTax: number,
  globalDiscount: number
): InvoiceTotals => {
  let subtotal = 0;
  let totalItemsDiscount = 0;
  let totalItemsTax = 0;

  items.forEach(item => {
    const { subtotalHT, itemDiscountAmount, itemTaxAmount } = calculateItemTotals(item);
    subtotal += subtotalHT;
    totalItemsDiscount += itemDiscountAmount;
    totalItemsTax += itemTaxAmount;
  });

  // Remise globale appliquée sur le montant net après remises articles
  const afterItemDiscounts = subtotal - totalItemsDiscount;
  const globalDiscountTotal = afterItemDiscounts * (globalDiscount / 100);

  // Base de calcul pour la TVA globale après toutes les remises
  const afterAllDiscounts = afterItemDiscounts - globalDiscountTotal;

  // TVA globale
  const globalTaxTotal = afterAllDiscounts * (globalTax / 100);

  // Fusion des totaux
  const taxTotal = totalItemsTax + globalTaxTotal;
  const discountTotal = totalItemsDiscount + globalDiscountTotal;
  const total = afterAllDiscounts + taxTotal;

  return enrichTotals({
    subtotal,
    taxTotal,
    discountTotal,
    total
  });
};

/**
 * Génère un identifiant unique pour un nouvel article.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
