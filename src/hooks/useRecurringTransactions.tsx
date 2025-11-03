import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RecurringTransaction = Database["public"]["Tables"]["transactions"]["Row"] & {
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
        .from("transactions")
        .select(`
          *,
          budget_categories (*)
        `)
        .eq("user_id", user.id)
        .eq("is_recurring", true)
        .is("parent_transaction_id", null)
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
        .from("transactions")
        .update({ is_recurring: false })
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

export function useProcessRecurringTransactions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      console.log('[Manual Process] Invoking process-recurring-transactions function...');
      
      const { data, error } = await supabase.functions.invoke(
        'process-recurring-transactions',
        { body: {} }
      );
      
      if (error) {
        console.error('[Manual Process] Error:', error);
        throw error;
      }
      
      console.log('[Manual Process] Result:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
      
      const message = data.generated > 0 
        ? `${data.generated} nova${data.generated > 1 ? 's' : ''} transaç${data.generated > 1 ? 'ões' : 'ão'} gerada${data.generated > 1 ? 's' : ''}!`
        : 'Todas as transações recorrentes já foram processadas.';
      
      toast({
        title: "Processamento concluído",
        description: message,
      });
    },
    onError: (error: any) => {
      console.error('[Manual Process] Toast error:', error);
      
      const errorMessage = error.message || error.error || "Não foi possível processar as transações recorrentes.";
      
      toast({
        title: "Erro ao processar",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
