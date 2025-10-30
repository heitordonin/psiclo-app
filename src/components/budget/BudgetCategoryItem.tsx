import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatCurrency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface BudgetCategoryItemProps {
  category: Category & { budget: number; spent: number };
}

export function BudgetCategoryItem({ category }: BudgetCategoryItemProps) {
  const { budget, spent } = category;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80 && percentage <= 100;

  const getProgressColor = () => {
    if (isOverBudget) return "bg-destructive";
    if (isNearLimit) return "bg-orange-500";
    return "bg-success";
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <CategoryIcon icon={category.icon} color={category.color} size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{category.name}</p>
            {budget > 0 ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(spent)} de {formatCurrency(budget)}
              </p>
            ) : (
              <Badge variant="outline" className="text-xs mt-1">
                Sem orçamento definido
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        {budget > 0 && (
          <div className="space-y-1">
            <Progress
              value={Math.min(percentage, 100)}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
            {isOverBudget && (
              <p className="text-xs text-destructive font-medium">
                Excedido em {formatCurrency(spent - budget)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
