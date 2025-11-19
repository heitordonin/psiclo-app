import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import { CURRENCY_CONFIGS, type Currency } from "@/lib/formatters";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  currency?: Currency;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = 'BRL', placeholder, className, disabled, ...props }, ref) => {
    const config = CURRENCY_CONFIGS[currency];
    const defaultPlaceholder = `${config.symbol} 0${config.decimalSeparator}00`;

    return (
      <NumericFormat
        getInputRef={ref}
        value={value}
        onValueChange={(values) => {
          onChange(values.floatValue);
        }}
        thousandSeparator={config.thousandSeparator}
        decimalSeparator={config.decimalSeparator}
        prefix={`${config.symbol} `}
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        onFocus={(e) => {
          // Seleciona todo o texto ao focar para facilitar edição
          setTimeout(() => {
            e.target.select();
          }, 0);
        }}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
