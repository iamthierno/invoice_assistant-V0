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

export const COUNTRY_CODES = [
    { code: '+223', country: 'Mali' },
    { code: '+33', country: 'France' },
    { code: '+221', country: 'Sénégal' },
    { code: '+225', country: "Côte d'Ivoire" },
    { code: '+224', country: 'Guinée' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+228', country: 'Togo' },
    { code: '+229', country: 'Bénin' },
    { code: '+227', country: 'Niger' },
];

export const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add space every 2 digits
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
};
