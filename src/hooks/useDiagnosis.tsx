import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FinancialDiagnosis {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Receitas
  salary: number;
  other_income: number;
  
  // Despesas Fixas
  rent: number;
  condominium: number;
  electricity: number;
  water: number;
  internet_tv: number;
  mobile_phone: number;
  health_insurance: number;
  gym: number;
  education: number;
  insurance: number;
  other_fixed_expenses: number;
  
  // Despesas Variáveis
  leisure: number;
  personal_shopping: number;
  delivery: number;
  subscriptions: number;
  gifts: number;
  personal_care: number;
  travel: number;
  transportation: number;
  groceries: number;
  pharmacy: number;
  other_variable_expenses: number;
  
  // Endividamento
  credit_card_balance: number;
  credit_card_payment: number;
  personal_loan_balance: number;
  personal_loan_payment: number;
  vehicle_financing_balance: number;
  vehicle_financing_payment: number;
  home_financing_balance: number;
  home_financing_payment: number;
  overdraft_balance: number;
  overdraft_payment: number;
  other_debts_balance: number;
  other_debts_payment: number;
}

export interface DiagnosisIndicators {
  totalReceitas: number;
  totalDespesasFixas: number;
  totalDespesasVariaveis: number;
  totalSaldoDevedor: number;
  totalParcelasDividas: number;
  saldoMensal: number;
  taxaEndividamento: number;
  comprometimentoRenda: number;
  indiceLiquidez: number;
  healthScore: number;
  status: "success" | "warning" | "danger";
  statusText: "Saudável" | "Atenção" | "Crítico";
}

export function useDiagnosis() {
  const queryClient = useQueryClient();

  const { data: diagnosis, isLoading } = useQuery({
    queryKey: ["financial-diagnosis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("financial_diagnoses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FinancialDiagnosis | null;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FinancialDiagnosis) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("financial_diagnoses")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-diagnosis"] });
      toast.success("Diagnóstico salvo com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar diagnóstico");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FinancialDiagnosis> }) => {
      const { data: result, error } = await supabase
        .from("financial_diagnoses")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-diagnosis"] });
      toast.success("Diagnóstico atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar diagnóstico");
    },
  });

  const calculateIndicators = (data: FinancialDiagnosis): DiagnosisIndicators => {
    const totalReceitas = (data.salary || 0) + (data.other_income || 0);
    
    const totalDespesasFixas = 
      (data.rent || 0) +
      (data.condominium || 0) +
      (data.electricity || 0) +
      (data.water || 0) +
      (data.internet_tv || 0) +
      (data.mobile_phone || 0) +
      (data.health_insurance || 0) +
      (data.gym || 0) +
      (data.education || 0) +
      (data.insurance || 0) +
      (data.other_fixed_expenses || 0);
    
    const totalDespesasVariaveis =
      (data.leisure || 0) +
      (data.personal_shopping || 0) +
      (data.delivery || 0) +
      (data.subscriptions || 0) +
      (data.gifts || 0) +
      (data.personal_care || 0) +
      (data.travel || 0) +
      (data.transportation || 0) +
      (data.groceries || 0) +
      (data.pharmacy || 0) +
      (data.other_variable_expenses || 0);
    
    const totalSaldoDevedor =
      (data.credit_card_balance || 0) +
      (data.personal_loan_balance || 0) +
      (data.vehicle_financing_balance || 0) +
      (data.home_financing_balance || 0) +
      (data.overdraft_balance || 0) +
      (data.other_debts_balance || 0);
    
    const totalParcelasDividas =
      (data.credit_card_payment || 0) +
      (data.personal_loan_payment || 0) +
      (data.vehicle_financing_payment || 0) +
      (data.home_financing_payment || 0) +
      (data.overdraft_payment || 0) +
      (data.other_debts_payment || 0);
    
    const saldoMensal = totalReceitas - (totalDespesasFixas + totalDespesasVariaveis + totalParcelasDividas);
    const taxaEndividamento = totalReceitas > 0 ? (totalSaldoDevedor / (totalReceitas * 12)) * 100 : 0;
    const comprometimentoRenda = totalReceitas > 0 ? ((totalDespesasFixas + totalDespesasVariaveis + totalParcelasDividas) / totalReceitas) * 100 : 0;
    const indiceLiquidez = saldoMensal;
    
    // Calcular score de saúde
    let healthScore = 100;
    
    if (saldoMensal < 0) healthScore -= 40;
    if (taxaEndividamento > 50) healthScore -= 30;
    else if (taxaEndividamento > 30) healthScore -= 15;
    if (comprometimentoRenda > 80) healthScore -= 20;
    else if (comprometimentoRenda > 60) healthScore -= 10;
    if (indiceLiquidez > totalReceitas * 0.2) healthScore += 10;
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    let status: "success" | "warning" | "danger";
    let statusText: "Saudável" | "Atenção" | "Crítico";
    
    if (healthScore >= 70) {
      status = "success";
      statusText = "Saudável";
    } else if (healthScore >= 40) {
      status = "warning";
      statusText = "Atenção";
    } else {
      status = "danger";
      statusText = "Crítico";
    }
    
    return {
      totalReceitas,
      totalDespesasFixas,
      totalDespesasVariaveis,
      totalSaldoDevedor,
      totalParcelasDividas,
      saldoMensal,
      taxaEndividamento,
      comprometimentoRenda,
      indiceLiquidez,
      healthScore,
      status,
      statusText,
    };
  };

  return {
    diagnosis,
    isLoading,
    createMutation,
    updateMutation,
    calculateIndicators,
  };
}
