import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface TransactionFiltersProps {
  filters: {
    period: "current_month" | "last_3_months" | "all";
    type: "all" | "income" | "expense";
    search: string;
  };
  onFilterChange: (filters: Partial<TransactionFiltersProps["filters"]>) => void;
}

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchValue });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <div className="p-4 space-y-3 bg-background">
      {/* Período */}
      <Select
        value={filters.period}
        onValueChange={(value) =>
          onFilterChange({ period: value as typeof filters.period })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current_month">Mês atual</SelectItem>
          <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
          <SelectItem value="all">Todo período</SelectItem>
        </SelectContent>
      </Select>

      {/* Tipo - Toggle Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filters.type === "all" ? "default" : "outline"}
          className="flex-1"
          onClick={() => onFilterChange({ type: "all" })}
        >
          Todas
        </Button>
        <Button
          variant={filters.type === "income" ? "default" : "outline"}
          className="flex-1"
          onClick={() => onFilterChange({ type: "income" })}
        >
          Receitas
        </Button>
        <Button
          variant={filters.type === "expense" ? "default" : "outline"}
          className="flex-1"
          onClick={() => onFilterChange({ type: "expense" })}
        >
          Despesas
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transação..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
