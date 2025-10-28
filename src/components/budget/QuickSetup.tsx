import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatCurrency } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface QuickSetupProps {
  categories: Category[];
  currentBudgets?: Record<string, number>;
  onComplete: (budgets: Record<string, number>) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export function QuickSetup({
  categories,
  currentBudgets,
  onComplete,
  onClose,
  isSaving = false,
}: QuickSetupProps) {
  const initialTotal = useMemo(() => {
    if (!currentBudgets) return 0;
    return Object.values(currentBudgets).reduce((sum, val) => sum + val, 0);
  }, [currentBudgets]);

  const [totalBudget, setTotalBudget] = useState<number>(initialTotal);
  const [budgets, setBudgets] = useState<Record<string, number>>(
    currentBudgets || {}
  );

  const currentTotal = useMemo(() => {
    return Object.values(budgets).reduce((sum, val) => sum + (val || 0), 0);
  }, [budgets]);

  const handleDistribute = () => {
    if (totalBudget <= 0 || categories.length === 0) return;

    // Distribuir igualmente
    const amountPerCategory = totalBudget / categories.length;
    const newBudgets: Record<string, number> = {};
    
    categories.forEach((cat) => {
      newBudgets[cat.id] = Math.round(amountPerCategory * 100) / 100;
    });

    setBudgets(newBudgets);
  };

  const handleSave = () => {
    // Filtrar apenas categorias com valor > 0
    const validBudgets = Object.entries(budgets)
      .filter(([_, amount]) => amount > 0)
      .reduce((acc, [id, amount]) => ({ ...acc, [id]: amount }), {});

    if (Object.keys(validBudgets).length > 0) {
      onComplete(validBudgets);
    }
  };

  const hasValidBudgets = Object.values(budgets).some((val) => val > 0);

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Configuração de Orçamento</SheetTitle>
          <SheetDescription>
            Defina o orçamento total e distribua entre as categorias
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
          {/* Orçamento total */}
          <div>
            <Label htmlFor="total-budget" className="mb-2 block">
              Orçamento Total Mensal
            </Label>
            <CurrencyInput
              value={totalBudget}
              onChange={(value) => setTotalBudget(value || 0)}
              placeholder="R$ 0,00"
              className="h-12"
            />
            <Button
              variant="link"
              size="sm"
              onClick={handleDistribute}
              disabled={totalBudget <= 0}
              className="px-0 mt-1"
            >
              Distribuir automaticamente
            </Button>
          </div>

          {/* Lista de categorias */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Label className="mb-2">Categorias</Label>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg"
                  >
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size={16}
                    />
                    <span className="flex-1 text-sm font-medium truncate">
                      {category.name}
                    </span>
                    <CurrencyInput
                      value={budgets[category.id] || 0}
                      onChange={(value) =>
                        setBudgets((prev) => ({
                          ...prev,
                          [category.id]: value || 0,
                        }))
                      }
                      placeholder="R$ 0,00"
                      className="w-32 h-9 text-sm"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Total e validação */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total definido:</span>
              <span className="text-lg font-bold">
                {formatCurrency(currentTotal)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasValidBudgets || isSaving}
                className="flex-1"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configuração
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
