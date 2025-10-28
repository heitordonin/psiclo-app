-- Criar tabela de diagnósticos financeiros
CREATE TABLE public.financial_diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Receitas
  salary NUMERIC DEFAULT 0,
  other_income NUMERIC DEFAULT 0,
  
  -- Despesas Fixas
  rent NUMERIC DEFAULT 0,
  condominium NUMERIC DEFAULT 0,
  electricity NUMERIC DEFAULT 0,
  water NUMERIC DEFAULT 0,
  internet_tv NUMERIC DEFAULT 0,
  mobile_phone NUMERIC DEFAULT 0,
  health_insurance NUMERIC DEFAULT 0,
  gym NUMERIC DEFAULT 0,
  education NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  other_fixed_expenses NUMERIC DEFAULT 0,
  
  -- Despesas Variáveis
  leisure NUMERIC DEFAULT 0,
  personal_shopping NUMERIC DEFAULT 0,
  delivery NUMERIC DEFAULT 0,
  subscriptions NUMERIC DEFAULT 0,
  gifts NUMERIC DEFAULT 0,
  personal_care NUMERIC DEFAULT 0,
  travel NUMERIC DEFAULT 0,
  transportation NUMERIC DEFAULT 0,
  groceries NUMERIC DEFAULT 0,
  pharmacy NUMERIC DEFAULT 0,
  other_variable_expenses NUMERIC DEFAULT 0,
  
  -- Endividamento
  credit_card_balance NUMERIC DEFAULT 0,
  credit_card_payment NUMERIC DEFAULT 0,
  personal_loan_balance NUMERIC DEFAULT 0,
  personal_loan_payment NUMERIC DEFAULT 0,
  vehicle_financing_balance NUMERIC DEFAULT 0,
  vehicle_financing_payment NUMERIC DEFAULT 0,
  home_financing_balance NUMERIC DEFAULT 0,
  home_financing_payment NUMERIC DEFAULT 0,
  overdraft_balance NUMERIC DEFAULT 0,
  overdraft_payment NUMERIC DEFAULT 0,
  other_debts_balance NUMERIC DEFAULT 0,
  other_debts_payment NUMERIC DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.financial_diagnoses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own diagnoses"
  ON public.financial_diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnoses"
  ON public.financial_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnoses"
  ON public.financial_diagnoses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnoses"
  ON public.financial_diagnoses FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_financial_diagnoses_updated_at
  BEFORE UPDATE ON public.financial_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();