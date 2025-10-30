import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatCurrency } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryWithBudget extends Category {
  budget: number;
  spent: number;
}

interface BudgetCategoryItemEditableProps {
  category: CategoryWithBudget;
  onBudgetChange: (value: number) => void;
  isSaving?: boolean;
}

export function BudgetCategoryItemEditable({
  category,
  onBudgetChange,
  isSaving = false,
}: BudgetCategoryItemEditableProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const percentageUsed = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;

  const getStatusColor = () => {
    if (percentageUsed > 100) return "text-destructive";
    if (percentageUsed > 80) return "text-orange-500";
    return "text-success";
  };

  const getProgressColor = () => {
    if (percentageUsed > 100) return "bg-destructive";
    if (percentageUsed > 80) return "bg-orange-500";
    return "bg-success";
  };

  // Debounce para auto-save
  const handleChange = (value: number | undefined) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onBudgetChange(value || 0);
    }, 800);
  };

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        {/* Ícone + Nome da categoria + Status */}
        <div className="flex items-start gap-3 mb-3">
          <CategoryIcon
            icon={category.icon}
            color={category.color}
            size={20}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base truncate">{category.name}</p>
            {category.budget > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Gasto: <span className={getStatusColor()}>{formatCurrency(category.spent)}</span> de {formatCurrency(category.budget)}
              </p>
            )}
          </div>
          {isSaving && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
          )}
        </div>

        {/* Input para editar meta - MOBILE FRIENDLY */}
        <div className="space-y-2">
          <Label htmlFor={`budget-${category.id}`} className="text-sm">
            Meta mensal
          </Label>
          <CurrencyInput
            value={category.budget}
            onChange={handleChange}
            placeholder="R$ 0,00"
            className="h-12 text-base"
          />
        </div>

        {/* Progress bar (se budget > 0) */}
        {category.budget > 0 && (
          <div className="mt-3 space-y-1">
            <Progress
              value={Math.min(percentageUsed, 100)}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${getStatusColor()}`}>
                {Math.round(percentageUsed)}%
              </span>
              {percentageUsed > 100 && (
                <span className="text-xs text-destructive font-medium">
                  Excedido em {formatCurrency(category.spent - category.budget)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
