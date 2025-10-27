import { BudgetCategoryItem } from "./BudgetCategoryItem";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryWithBudget extends Category {
  budget: number;
  spent: number;
}

interface BudgetCategoryListProps {
  categories: CategoryWithBudget[];
  onEditBudget: (category: CategoryWithBudget) => void;
}

export function BudgetCategoryList({
  categories,
  onEditBudget,
}: BudgetCategoryListProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">Nenhuma categoria encontrada</p>
        <p className="text-sm text-muted-foreground">
          Crie categorias de despesas para começar a usar o orçamento
        </p>
      </div>
    );
  }

  // Separar e ordenar categorias
  const withBudget = categories.filter((c) => c.budget > 0);
  const withoutBudget = categories.filter((c) => c.budget === 0);

  // Ordenar categorias com orçamento por % usado (descendente)
  const sortedWithBudget = withBudget.sort((a, b) => {
    const percentA = (a.spent / a.budget) * 100;
    const percentB = (b.spent / b.budget) * 100;
    return percentB - percentA;
  });

  // Ordenar categorias sem orçamento por nome
  const sortedWithoutBudget = withoutBudget.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const allCategories = [...sortedWithBudget, ...sortedWithoutBudget];

  return (
    <div className="space-y-2 pb-4">
      {allCategories.map((category) => (
        <BudgetCategoryItem
          key={category.id}
          category={category}
          budget={category.budget}
          spent={category.spent}
          onEdit={() => onEditBudget(category)}
        />
      ))}
    </div>
  );
}
