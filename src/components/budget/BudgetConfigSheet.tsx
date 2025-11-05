import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { isKnownIncomeName } from "@/hooks/useFixCategoryTypes";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryWithBudget extends Category {
  budget: number;
  spent: number;
}

interface BudgetConfigSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithBudget[];
  onSave: (budgets: Record<string, number>) => Promise<void>;
}

export function BudgetConfigSheet({
  open,
  onOpenChange,
  categories,
  onSave,
}: BudgetConfigSheetProps) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initialBudgets = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.budget;
        return acc;
      }, {} as Record<string, number>);
      setBudgets(initialBudgets);
    }
  }, [open, categories]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(budgets);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + (val || 0), 0);

  // Filtrar apenas categorias de despesa
  // Também filtramos por nome para proteção extra contra categorias com tipo incorreto
  const expenseCategories = categories.filter(cat => 
    cat.type === "expense" && !isKnownIncomeName(cat.name)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>Configurar Metas de Gasto</SheetTitle>
          <SheetDescription>
            Defina o valor de meta para cada categoria
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-180px)] mt-6 pr-4">
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CategoryIcon icon={category.icon} color={category.color} size={20} />
                  <Label className="text-sm font-medium">
                    {category.name}
                  </Label>
                </div>
                <CurrencyInput
                  value={budgets[category.id] || 0}
                  onChange={(value) => setBudgets({ ...budgets, [category.id]: value || 0 })}
                  className="h-12 text-base"
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total das metas:</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalBudget)}
            </span>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Metas"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
