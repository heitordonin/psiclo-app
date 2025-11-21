import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export type PeriodType = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'last-year' | 'custom';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  period: PeriodType;
}

interface PeriodSelectorProps {
  value: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const periods: { value: PeriodType; label: string }[] = [
    { value: 'this-month', label: 'Este Mês' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'last-3-months', label: 'Últimos 3 Meses' },
    { value: 'last-6-months', label: 'Últimos 6 Meses' },
    { value: 'this-year', label: 'Este Ano' },
    { value: 'last-year', label: 'Ano Passado' },
  ];

  const handlePeriodChange = (period: PeriodType) => {
    onChange({
      period,
      startDate: value.startDate,
      endDate: value.endDate
    });
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onChange({
        period: 'custom',
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to, 'yyyy-MM-dd')
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value.period === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={value.period === 'custom' ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {value.period === 'custom' && dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, 'dd/MM')} - ${format(dateRange.to, 'dd/MM')}`
              : 'Personalizado'
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleCustomDateChange}
            locale={ptBR}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
