import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatCurrency } from "@/lib/formatters";
import { Edit } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface BudgetCategoryItemProps {
  category: Category;
  budget: number;
  spent: number;
  onEdit: () => void;
}

export function BudgetCategoryItem({
  category,
  budget,
  spent,
  onEdit,
}: BudgetCategoryItemProps) {
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
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

          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 shrink-0">
            <Edit className="h-4 w-4" />
          </Button>
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
