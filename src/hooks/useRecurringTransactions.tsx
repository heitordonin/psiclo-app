import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RecurringTransaction = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  type: "income" | "expense";
  recurrence_pattern: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  recurrence_end_date: string | null;
  recurrence_count: number | null;
  is_active: boolean;
  created_at: string;
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

export function useRecurringTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["recurring-transactions", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("recurring_transactions" as any)
        .select(`
          *,
          budget_categories (*)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as RecurringTransaction[];
    },
    enabled: !!user,
  });

  return query;
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_transactions" as any)
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
      toast({
        title: "Transação recorrente removida",
        description: "A transação recorrente foi desativada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a transação recorrente.",
        variant: "destructive",
      });
    },
  });
}
