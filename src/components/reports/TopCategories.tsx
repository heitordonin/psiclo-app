import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { CategoryReport } from "@/lib/report-utils";

interface TopCategoriesProps {
  categories: CategoryReport[];
}

export function TopCategories({ categories }: TopCategoriesProps) {
  const topCategories = categories.slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Top 5 Categorias</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {topCategories.map((category, index) => (
          <Card key={category.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <CategoryIcon 
                icon={category.icon || 'Wallet'} 
                color={category.color} 
                size={20}
              />
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
            
            <h4 className="font-semibold text-sm mb-1 truncate">{category.name}</h4>
            <p className="text-2xl font-bold mb-2">
              {formatCurrency(category.total)}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{category.percentage.toFixed(0)}% do total</span>
              <span>{category.transactionCount} transações</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
