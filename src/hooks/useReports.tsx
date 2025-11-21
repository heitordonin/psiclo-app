import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";
import { groupTransactionsByCategory, calculateDREData, generateInsights } from "@/lib/report-utils";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

export type PeriodType = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'last-year' | 'custom';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  period: PeriodType;
}

function calculateDateRange(period: PeriodType): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();
  
  switch (period) {
    case 'this-month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
        label: format(now, "MMMM 'de' yyyy", { locale: ptBR })
      };
    
    case 'last-month':
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
        label: format(lastMonth, "MMMM 'de' yyyy", { locale: ptBR })
      };
    
    case 'last-3-months':
      return {
        startDate: startOfMonth(subMonths(now, 2)),
        endDate: endOfMonth(now),
        label: 'Últimos 3 meses'
      };
    
    case 'last-6-months':
      return {
        startDate: startOfMonth(subMonths(now, 5)),
        endDate: endOfMonth(now),
        label: 'Últimos 6 meses'
      };
    
    case 'this-year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
        label: format(now, "yyyy", { locale: ptBR })
      };
    
    case 'last-year':
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
        label: format(lastYear, "yyyy", { locale: ptBR })
      };
    
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
        label: format(now, "MMMM 'de' yyyy", { locale: ptBR })
      };
  }
}

export function useExpenseReports(filters: ReportFilters) {
  const { startDate, endDate, label } = filters.period === 'custom'
    ? {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
        label: `${format(new Date(filters.startDate), 'dd/MM/yyyy')} - ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`
      }
    : calculateDateRange(filters.period);

  return useQuery({
    queryKey: ['expense-reports', filters],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar transações de despesas
      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select(`
          *,
          budget_categories (*)
        `)
        .eq("user_id", userData.user.id)
        .eq("type", "expense")
        .gte("transaction_date", format(startDate, 'yyyy-MM-dd'))
        .lte("transaction_date", format(endDate, 'yyyy-MM-dd'))
        .order("transaction_date", { ascending: false });

      if (transError) throw transError;

      // Buscar todas as categorias
      const { data: categories, error: catError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("type", "expense");

      if (catError) throw catError;

      const typedTransactions = transactions as (Transaction & { budget_categories?: Category | null })[];
      const typedCategories = categories as Category[];

      // Agrupar por categoria
      const categoryReports = groupTransactionsByCategory(typedTransactions, typedCategories);

      // Calcular DRE
      const dreData = calculateDREData(typedTransactions, typedCategories, label);

      // Calcular período anterior para comparação
      const periodLength = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodLength);
      const previousEndDate = new Date(endDate.getTime() - periodLength);

      const { data: previousTransactions } = await supabase
        .from("transactions")
        .select(`
          *,
          budget_categories (*)
        `)
        .eq("user_id", userData.user.id)
        .eq("type", "expense")
        .gte("transaction_date", format(previousStartDate, 'yyyy-MM-dd'))
        .lte("transaction_date", format(previousEndDate, 'yyyy-MM-dd'));

      const previousDreData = previousTransactions
        ? calculateDREData(
            previousTransactions as (Transaction & { budget_categories?: Category | null })[],
            typedCategories,
            'Período Anterior'
          )
        : undefined;

      // Gerar insights
      const insights = generateInsights(dreData, previousDreData);

      return {
        transactions: typedTransactions,
        categories: typedCategories,
        categoryReports,
        dreData,
        previousDreData,
        insights,
        period: {
          startDate,
          endDate,
          label
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useExpensesTimeline(filters: ReportFilters) {
  const { startDate, endDate } = filters.period === 'custom'
    ? {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate)
      }
    : calculateDateRange(filters.period);

  return useQuery({
    queryKey: ['expenses-timeline', filters],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
          *,
          budget_categories (*)
        `)
        .eq("user_id", userData.user.id)
        .eq("type", "expense")
        .gte("transaction_date", format(startDate, 'yyyy-MM-dd'))
        .lte("transaction_date", format(endDate, 'yyyy-MM-dd'))
        .order("transaction_date", { ascending: true });

      if (error) throw error;

      // Agrupar por data
      const dailyData = new Map<string, number>();
      transactions?.forEach(t => {
        const date = t.transaction_date;
        const current = dailyData.get(date) || 0;
        dailyData.set(date, current + Math.abs(Number(t.amount)));
      });

      // Converter para array
      const timelineData = Array.from(dailyData.entries())
        .map(([date, total]) => ({
          date,
          total,
          label: format(new Date(date), 'dd/MMM', { locale: ptBR })
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return timelineData;
    },
    staleTime: 5 * 60 * 1000,
  });
}
