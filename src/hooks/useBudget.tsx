import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Budget = Database["public"]["Tables"]["budgets"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface BudgetsData {
  items: Budget[];
  totalPlanned: number;
}

interface MonthlySpendingData {
  byCategory: Record<string, number>;
  total: number;
}

interface BudgetSuggestions {
  lastMonth: number;
  avg3Months: number;
  history: Array<{ month: string; amount: number }>;
}

export function useBudgets(month: Date) {
  return useQuery<BudgetsData>({
    queryKey: ["budgets", format(month, "yyyy-MM")],
    queryFn: async () => {
      const monthStr = format(startOfMonth(month), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          budget_categories (
            id,
            name,
            icon,
            color,
            type
          )
        `)
        .eq("month", monthStr);

      if (error) throw error;

      const items = (data as Budget[]) || [];
      const totalPlanned = items.reduce((sum, b) => sum + (b.planned_amount || 0), 0);

      return { items, totalPlanned };
    },
  });
}

export function useMonthlySpending(month: Date) {
  return useQuery<MonthlySpendingData>({
    queryKey: ["monthly-spending", format(month, "yyyy-MM")],
    queryFn: async () => {
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end = format(endOfMonth(month), "yyyy-MM-dd");

      // Buscar todas as categorias do usuário para mapear subcategorias
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Usuário não autenticado");

      const { data: allCategories, error: categoriesError } = await supabase
        .from("budget_categories")
        .select("id, parent_id")
        .eq("user_id", userData.user.id);

      if (categoriesError) throw categoriesError;

      const { data, error } = await supabase
        .from("transactions")
        .select("category_id, amount, type")
        .gte("transaction_date", start)
        .lte("transaction_date", end)
        .eq("type", "expense");

      if (error) throw error;

      // Agregar gastos por categoria, somando subcategorias na categoria mãe
      const byCategory = (data || []).reduce((acc, t) => {
        const category = allCategories?.find(c => c.id === t.category_id);
        
        // Se for subcategoria, usar o parent_id como chave, senão usar category_id
        const categoryKey = category?.parent_id || t.category_id;
        
        acc[categoryKey] = (acc[categoryKey] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      const total = (data || []).reduce((sum, t) => sum + t.amount, 0);

      return { byCategory, total };
    },
  });
}

export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      month,
      amount,
    }: {
      categoryId: string;
      month: Date;
      amount: number;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const monthStr = format(startOfMonth(month), "yyyy-MM-dd");

      const { error } = await supabase.from("budgets").upsert(
        {
          category_id: categoryId,
          month: monthStr,
          planned_amount: amount,
          user_id: userData.user?.id,
        },
        { onConflict: 'user_id,category_id,month' }
      );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", format(variables.month, "yyyy-MM")] });
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o orçamento",
        variant: "destructive",
      });
      console.error("Error setting budget:", error);
    },
  });
}

export function useBudgetSuggestions(categoryId: string) {
  return useQuery<BudgetSuggestions>({
    queryKey: ["budget-suggestions", categoryId],
    queryFn: async () => {
      // Buscar todas as categorias para identificar subcategorias
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Usuário não autenticado");

      const { data: allCategories } = await supabase
        .from("budget_categories")
        .select("id, parent_id")
        .eq("user_id", userData.user.id);

      // Encontrar todas as categorias relacionadas (a categoria + suas filhas)
      const categoryIds = [categoryId];
      const subcategories = allCategories?.filter(c => c.parent_id === categoryId) || [];
      categoryIds.push(...subcategories.map(c => c.id));

      const months = [1, 2, 3].map((i) => subMonths(new Date(), i));

      const spending = await Promise.all(
        months.map(async (month) => {
          const start = format(startOfMonth(month), "yyyy-MM-dd");
          const end = format(endOfMonth(month), "yyyy-MM-dd");

          const { data } = await supabase
            .from("transactions")
            .select("amount")
            .in("category_id", categoryIds) // Buscar pela categoria E subcategorias
            .gte("transaction_date", start)
            .lte("transaction_date", end)
            .eq("type", "expense");

          return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
        })
      );

      return {
        lastMonth: spending[0],
        avg3Months: spending.reduce((a, b) => a + b, 0) / 3,
        history: spending.map((amount, i) => ({
          month: format(subMonths(new Date(), i + 1), "MMM"),
          amount,
        })),
      };
    },
    enabled: !!categoryId,
  });
}

export function useCopyBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fromMonth,
      toMonth,
    }: {
      fromMonth: Date;
      toMonth: Date;
    }) => {
      const fromMonthStr = format(startOfMonth(fromMonth), "yyyy-MM-dd");
      const toMonthStr = format(startOfMonth(toMonth), "yyyy-MM-dd");

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: budgets, error: fetchError } = await supabase
        .from("budgets")
        .select("category_id, planned_amount")
        .eq("month", fromMonthStr);

      if (fetchError) throw fetchError;

      if (!budgets || budgets.length === 0) {
        throw new Error("Nenhum orçamento encontrado no mês anterior");
      }

      const insertData = budgets.map((b) => ({
        user_id: userData.user?.id,
        category_id: b.category_id,
        month: toMonthStr,
        planned_amount: b.planned_amount,
      }));

      const { error: insertError } = await supabase
        .from("budgets")
        .upsert(insertData, { onConflict: 'user_id,category_id,month' });

      if (insertError) throw insertError;

      return budgets.length;
    },
    onSuccess: (count, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", format(variables.toMonth, "yyyy-MM")] });
      toast({
        title: "Sucesso",
        description: `${count} orçamento(s) copiado(s) com sucesso`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível copiar o orçamento",
        variant: "destructive",
      });
      console.error("Error copying budget:", error);
    },
  });
}
