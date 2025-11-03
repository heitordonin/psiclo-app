import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface MetricsData {
  balance: number;
  income: number;
  expenses: number;
  dailyData: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export function useMetrics(period: "current_month" | "last_3_months" | "all" = "current_month") {
  const queryClient = useQueryClient();

  // Realtime subscription for transactions
  useEffect(() => {
    const channel = supabase
      .channel('metrics-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["metrics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["metrics", period],
    queryFn: async (): Promise<MetricsData> => {
      const now = new Date();
      let startDate: Date;

      if (period === "current_month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === "last_3_months") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      } else {
        // all time - use a very old date
        startDate = new Date(2000, 0, 1);
      }

      // Fetch transactions for the period
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", startDate.toISOString().split("T")[0])
        .order("transaction_date");

      if (error) throw error;

      // Filter out future transactions for metrics calculation
      const today = new Date().toISOString().split("T")[0];
      const pastTransactions = transactions?.filter(
        (t) => t.transaction_date <= today
      ) || [];

      // Calculate totals (excluding future transactions)
      let income = 0;
      let expenses = 0;

      pastTransactions.forEach((t) => {
        const amount = Number(t.amount);
        if (t.type === "income") {
          income += amount;
        } else {
          expenses += amount;
        }
      });

      const balance = income - expenses;

      // Calculate daily data for last 7 days
      const dailyData = [];
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 6); // Last 7 days including today

      for (let i = 0; i < 7; i++) {
        const date = new Date(last7Days);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        const dayTransactions = pastTransactions.filter(
          (t) => t.transaction_date === dateStr
        );

        const dayIncome = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const dayExpenses = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        dailyData.push({
          date: dateStr,
          income: dayIncome,
          expenses: dayExpenses,
          balance: dayIncome - dayExpenses,
        });
      }

      return {
        balance,
        income,
        expenses,
        dailyData,
      };
    },
  });
}
