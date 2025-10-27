import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const handlePrevMonth = () => {
    onChange(subMonths(value, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(value, 1));
  };

  const isNextDisabled = isAfter(addMonths(value, 1), new Date());

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-[150px] text-center">
        <span className="text-sm font-medium text-primary-foreground capitalize">
          {format(value, "MMMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        disabled={isNextDisabled}
        className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
