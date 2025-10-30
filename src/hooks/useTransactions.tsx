import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

interface TransactionFilters {
  period?: "current_month" | "last_3_months" | "all";
  type?: "income" | "expense" | "all";
  search?: string;
  limit?: number;
}

export function useTransactions(filters?: TransactionFilters) {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          queryClient.invalidateQueries({ queryKey: ["metrics"] });
          queryClient.invalidateQueries({ queryKey: ["monthly-spending"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
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
        .order("transaction_date", { ascending: false });

      // Filter by period
      if (filters?.period && filters.period !== "all") {
        const now = new Date();
        let startDate: Date;

        if (filters.period === "current_month") {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          // last_3_months
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        }

        query = query.gte("transaction_date", startDate.toISOString().split("T")[0]);
      }

      // Filter by type
      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      // Filter by search
      if (filters?.search) {
        query = query.ilike("description", `%${filters.search}%`);
      }

      // Limit results
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação",
        variant: "destructive",
      });
      console.error("Error creating transaction:", error);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a transação",
        variant: "destructive",
      });
      console.error("Error updating transaction:", error);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação",
        variant: "destructive",
      });
      console.error("Error deleting transaction:", error);
    },
  });
}
