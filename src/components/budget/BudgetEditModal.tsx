import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { MiniBarChart } from "./MiniBarChart";
import { useBudgetSuggestions } from "@/hooks/useBudget";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface BudgetEditModalProps {
  category: Category;
  month: Date;
  currentBudget: number;
  onSave: (amount: number) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export function BudgetEditModal({
  category,
  month,
  currentBudget,
  onSave,
  onClose,
  isSaving = false,
}: BudgetEditModalProps) {
  const [amount, setAmount] = useState<number>(currentBudget || 0);
  const { data: suggestions, isLoading } = useBudgetSuggestions(category.id);

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    }
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Definir Orçamento</SheetTitle>
          <SheetDescription>
            {category.name} - {format(month, "MMMM yyyy", { locale: ptBR })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Input de valor */}
          <div>
            <Label htmlFor="budget-amount" className="mb-2 block">
              Valor do Orçamento
            </Label>
            <CurrencyInput
              value={amount}
              onChange={(value) => setAmount(value || 0)}
              placeholder="R$ 0,00"
              className="text-2xl font-bold h-14"
            />
          </div>

          {/* Sugestões baseadas em histórico */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions && (suggestions.lastMonth > 0 || suggestions.avg3Months > 0) ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Sugestões baseadas no seu histórico:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.lastMonth > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(suggestions.lastMonth)}
                    className="flex flex-col items-start h-auto py-2 px-3"
                  >
                    <span className="text-xs text-muted-foreground">Mês passado</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(suggestions.lastMonth)}
                    </span>
                  </Button>
                )}
                {suggestions.avg3Months > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(suggestions.avg3Months)}
                    className="flex flex-col items-start h-auto py-2 px-3"
                  >
                    <span className="text-xs text-muted-foreground">
                      Média 3 meses
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(suggestions.avg3Months)}
                    </span>
                  </Button>
                )}
              </div>

              {/* Histórico visual */}
              {suggestions.history && suggestions.history.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Gastos anteriores:</p>
                  <MiniBarChart data={suggestions.history} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Sem histórico de gastos para esta categoria
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={amount <= 0 || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Orçamento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
