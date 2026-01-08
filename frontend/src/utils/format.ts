export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR').replace(/\u00a0/g, ' ');
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
};
