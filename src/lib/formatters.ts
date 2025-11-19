export type Currency = 'BRL' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  locale: string;
  decimalSeparator: string;
  thousandSeparator: string;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR',
    decimalSeparator: ',',
    thousandSeparator: '.'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimalSeparator: '.',
    thousandSeparator: ','
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    decimalSeparator: ',',
    thousandSeparator: '.'
  }
};

export function formatCurrency(value: number, currency: Currency = 'BRL'): string {
  const config = CURRENCY_CONFIGS[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}
