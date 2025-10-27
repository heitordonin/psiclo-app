import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { BudgetCategoryList } from "@/components/budget/BudgetCategoryList";
import { BudgetEditModal } from "@/components/budget/BudgetEditModal";
import { QuickSetup } from "@/components/budget/QuickSetup";
import { BudgetDistributionChart } from "@/components/budget/BudgetDistributionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import {
  useBudgets,
  useMonthlySpending,
  useSetBudget,
  useCopyBudget,
} from "@/hooks/useBudget";
import { Settings, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { subMonths } from "date-fns";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryWithBudget extends Category {
  budget: number;
  spent: number;
}

export default function Budget() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [editingCategory, setEditingCategory] = useState<CategoryWithBudget | null>(null);
  const [showQuickSetup, setShowQuickSetup] = useState(false);

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useCategories("expense");
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(selectedMonth);
  const { data: spending, isLoading: spendingLoading } = useMonthlySpending(selectedMonth);

  // Mutations
  const setBudget = useSetBudget();
  const copyBudget = useCopyBudget();

  // Cálculos derivados
  const totalBudget = budgets?.totalPlanned || 0;
  const totalSpent = spending?.total || 0;
  const remaining = totalBudget - totalSpent;

  // Combinar dados para lista
  const categoriesWithBudget: CategoryWithBudget[] =
    categories?.map((cat) => ({
      ...cat,
      budget:
        budgets?.items.find((b) => b.category_id === cat.id)?.planned_amount || 0,
      spent: spending?.byCategory[cat.id] || 0,
    })) || [];

  // Sistema de alertas
  useEffect(() => {
    if (!budgets || !spending) return;

    const alertKey = `budget-alert-${selectedMonth.getTime()}`;
    if (sessionStorage.getItem(alertKey)) return;

    budgets.items.forEach((budget) => {
      if (!budget.budget_categories) return;

      const spent = spending.byCategory[budget.category_id] || 0;
      const percentage = (spent / budget.planned_amount) * 100;

      if (percentage >= 100) {
        toast({
          title: "⚠️ Orçamento Excedido",
          description: `${budget.budget_categories.name} ultrapassou o orçamento!`,
          variant: "destructive",
        });
      } else if (percentage >= 90) {
        toast({
          title: "⚠️ Atenção",
          description: `${budget.budget_categories.name} está em ${Math.round(percentage)}% do orçamento`,
        });
      }
    });

    sessionStorage.setItem(alertKey, "true");
  }, [budgets, spending, selectedMonth]);

  // Handlers
  const handleEditBudget = (category: CategoryWithBudget) => {
    setEditingCategory(category);
  };

  const handleSaveBudget = async (amount: number) => {
    if (!editingCategory) return;

    await setBudget.mutateAsync({
      categoryId: editingCategory.id,
      month: selectedMonth,
      amount,
    });
    setEditingCategory(null);
  };

  const handleQuickSetupComplete = async (budgetsData: Record<string, number>) => {
    try {
      await Promise.all(
        Object.entries(budgetsData).map(([categoryId, amount]) =>
          setBudget.mutateAsync({
            categoryId,
            month: selectedMonth,
            amount,
          })
        )
      );
      setShowQuickSetup(false);
    } catch (error) {
      console.error("Error saving budgets:", error);
    }
  };

  const handleCopyLastMonth = () => {
    const lastMonth = subMonths(selectedMonth, 1);
    copyBudget.mutate({
      fromMonth: lastMonth,
      toMonth: selectedMonth,
    });
  };

  const isLoading = categoriesLoading || budgetsLoading || spendingLoading;

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* Header fixo */}
      <div className="bg-primary px-4 pb-4 pt-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-primary-foreground">Orçamento</h1>
          {budgets && budgets.items.length === 0 && !budgetsLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLastMonth}
              disabled={copyBudget.isPending}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar mês anterior
            </Button>
          )}
        </div>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            {/* Resumo */}
            <BudgetSummary
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              remaining={remaining}
            />

            {/* Gráfico de distribuição */}
            {budgets && budgets.items.length > 0 && (
              <div className="mx-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Distribuição do Orçamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BudgetDistributionChart budgets={budgets.items} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lista de categorias */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Categorias</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickSetup(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuração Rápida
                </Button>
              </div>

              <BudgetCategoryList
                categories={categoriesWithBudget}
                onEditBudget={handleEditBudget}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {editingCategory && (
        <BudgetEditModal
          category={editingCategory}
          month={selectedMonth}
          currentBudget={editingCategory.budget}
          onSave={handleSaveBudget}
          onClose={() => setEditingCategory(null)}
          isSaving={setBudget.isPending}
        />
      )}

      {showQuickSetup && categories && (
        <QuickSetup
          categories={categories}
          onComplete={handleQuickSetupComplete}
          onClose={() => setShowQuickSetup(false)}
          isSaving={setBudget.isPending}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
