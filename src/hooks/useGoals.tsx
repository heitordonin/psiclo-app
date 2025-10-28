import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type FinancialGoal = Database["public"]["Tables"]["financial_goals"]["Row"];
type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];

export function useFinancialGoals() {
  return useQuery<FinancialGoal[]>({
    queryKey: ["financial-goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateFinancialGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: {
      name: string;
      goal_type: string;
      target_amount: number;
      target_date?: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          name: goal.name,
          goal_type: 'custom',
          target_amount: goal.target_amount,
          target_date: goal.target_date,
          user_id: userData.user?.id,
          current_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast.success("Meta criada com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao criar meta:", error);
      const errorMessage = error?.message || "Não foi possível criar a meta";
      toast.error(errorMessage);
    },
  });
}

export function useUpdateFinancialGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FinancialGoal>;
    }) => {
      const { error } = await supabase
        .from("financial_goals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast.success("Meta atualizada com sucesso");
    },
    onError: () => {
      toast.error("Não foi possível atualizar a meta");
    },
  });
}

export function useDeleteFinancialGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast.success("Meta excluída com sucesso");
    },
    onError: () => {
      toast.error("Não foi possível excluir a meta");
    },
  });
}

export function useGoalContributions(goalId: string) {
  return useQuery<GoalContribution[]>({
    queryKey: ["goal-contributions", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_contributions")
        .select("*")
        .eq("goal_id", goalId)
        .order("contribution_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!goalId,
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      amount,
      date,
    }: {
      goalId: string;
      amount: number;
      date: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase.from("goal_contributions").insert({
        goal_id: goalId,
        user_id: userData.user?.id,
        amount,
        contribution_date: date,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal-contributions", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast.success("Aporte registrado com sucesso");
    },
    onError: () => {
      toast.error("Não foi possível registrar o aporte");
    },
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, goalId }: { id: string; goalId: string }) => {
      const { error } = await supabase
        .from("goal_contributions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return goalId;
    },
    onSuccess: (goalId) => {
      queryClient.invalidateQueries({ queryKey: ["goal-contributions", goalId] });
      queryClient.invalidateQueries({ queryKey: ["financial-goals"] });
      toast.success("Aporte removido com sucesso");
    },
    onError: () => {
      toast.error("Não foi possível remover o aporte");
    },
  });
}
