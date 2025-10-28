-- Criar tabela goal_contributions
CREATE TABLE public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  contribution_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_contribution UNIQUE (user_id, goal_id, contribution_date, amount)
);

-- Índices para performance
CREATE INDEX idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user_id ON public.goal_contributions(user_id);

-- Habilitar RLS
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own contributions"
  ON public.goal_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contributions"
  ON public.goal_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contributions"
  ON public.goal_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Criar função para atualizar current_amount automaticamente
CREATE OR REPLACE FUNCTION public.update_goal_current_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcular o total de contribuições para a meta
  UPDATE public.financial_goals
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.goal_contributions
    WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id)
  )
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para INSERT
CREATE TRIGGER trigger_update_goal_amount_on_insert
  AFTER INSERT ON public.goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_current_amount();

-- Trigger para DELETE
CREATE TRIGGER trigger_update_goal_amount_on_delete
  AFTER DELETE ON public.goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_current_amount();