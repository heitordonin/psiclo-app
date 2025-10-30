import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { BudgetDistributionChart } from "@/components/budget/BudgetDistributionChart";
import { BudgetCategoryItem } from "@/components/budget/BudgetCategoryItem";
import { BudgetConfigSheet } from "@/components/budget/BudgetConfigSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentCategories } from "@/hooks/useCategories";
import {
  useBudgets,
  useMonthlySpending,
  useSetBudget,
  useCopyBudget,
} from "@/hooks/useBudget";
import { Copy, Settings } from "lucide-react";
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
  const [configSheetOpen, setConfigSheetOpen] = useState(false);

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useParentCategories("expense");
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
  const handleSaveBudgets = async (budgets: Record<string, number>) => {
    try {
      await Promise.all(
        Object.entries(budgets).map(([categoryId, amount]) =>
          setBudget.mutateAsync({
            categoryId,
            month: selectedMonth,
            amount,
          })
        )
      );
      toast({
        title: "Metas atualizadas",
        description: "Suas metas de gasto foram salvas com sucesso!",
      });
    } catch (error) {
      console.error("Error saving budgets:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas metas. Tente novamente.",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header - NÃO fixo, rola com o conteúdo */}
      <div className="bg-primary px-4 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-primary-foreground mb-2">Metas de Gasto</h1>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

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
          {/* Resumo - READ ONLY (soma automática) */}
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

          {/* Botão de configuração e atalhos */}
          <div className="px-4 mb-4 flex gap-2">
            <Button
              onClick={() => setConfigSheetOpen(true)}
              className="flex-1"
              size="lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Metas
            </Button>
            {budgets && budgets.items.length === 0 && !budgetsLoading && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLastMonth}
                disabled={copyBudget.isPending}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar mês anterior
              </Button>
            )}
          </div>

          {/* Lista de categorias - visualização apenas */}
          <div className="px-4 space-y-3">
            <h2 className="font-semibold text-lg mb-3">Metas por Categoria</h2>
            {categoriesWithBudget.length > 0 ? (
              categoriesWithBudget.map((category) => (
                <BudgetCategoryItem key={category.id} category={category} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma meta configurada. Clique em "Configurar Metas" para começar.
              </p>
            )}
          </div>
        </>
      )}

      {/* Sheet de configuração */}
      <BudgetConfigSheet
        open={configSheetOpen}
        onOpenChange={setConfigSheetOpen}
        categories={categoriesWithBudget}
        onSave={handleSaveBudgets}
      />

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
