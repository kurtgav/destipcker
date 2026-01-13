export interface Currency {
    code: string;
    name: string;
    symbol: string;
    rate: number; // Rate to USD
}

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 56.5 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.2 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.83 },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1320 },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.72 },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 35.8 },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 15680 },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 24500 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.67 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.88 },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 10.5 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 10.8 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 6.87 },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', rate: 4.02 },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 22.8 },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 360 },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 92 },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 32.5 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.02 },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rate: 17.1 },
    { code: 'ARS', name: 'Argentine Peso', symbol: 'ARS$', rate: 850 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.5 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', rate: 3.75 },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 49 },
];

export function getCurrency(code: string): Currency | undefined {
    return CURRENCIES.find(c => c.code === code);
}

export function convertToUSD(amount: number, fromCurrency: string): number {
    const currency = getCurrency(fromCurrency);
    if (!currency) return amount;
    return amount / currency.rate;
}

export function convertFromUSD(amount: number, toCurrency: string): number {
    const currency = getCurrency(toCurrency);
    if (!currency) return amount;
    return amount * currency.rate;
}

export function formatCurrency(amount: number, currencyCode: string): string {
    const currency = getCurrency(currencyCode);
    if (!currency) return `${amount}`;

    // Format with appropriate decimal places
    const decimals = currency.rate > 100 ? 0 : 2;
    const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${currency.symbol}${formatted}`;
}

export function getPriceLevelFromBudget(budgetUSD: number): number {
    // Google Places price_level: 0 (free) to 4 (very expensive)
    if (budgetUSD < 10) return 1;
    if (budgetUSD < 30) return 2;
    if (budgetUSD < 60) return 3;
    return 4;
}
