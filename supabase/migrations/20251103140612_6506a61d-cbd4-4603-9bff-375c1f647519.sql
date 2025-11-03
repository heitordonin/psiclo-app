-- =============================================
-- ETAPA 1: MODIFICAR TABELA TRANSACTIONS
-- =============================================

-- Adicionar novos campos para controle de recorrência
ALTER TABLE public.transactions 
  ADD COLUMN parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  ADD COLUMN recurrence_end_date DATE,
  ADD COLUMN recurrence_count INTEGER,
  ADD COLUMN is_auto_generated BOOLEAN DEFAULT false;

-- Corrigir constraint de recurrence_pattern para incluir 'daily' e 'yearly'
ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS transactions_recurrence_pattern_check;

ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_recurrence_pattern_check 
  CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.transactions.parent_transaction_id IS 'ID da transação mãe que originou esta (NULL se for a original)';
COMMENT ON COLUMN public.transactions.recurrence_end_date IS 'Data limite para gerar recorrências (opcional, alternativa a count)';
COMMENT ON COLUMN public.transactions.recurrence_count IS 'Número de ocorrências a gerar (opcional, alternativa a end_date)';
COMMENT ON COLUMN public.transactions.is_auto_generated IS 'Flag indicando se foi criada automaticamente vs. criada pelo usuário';

-- Criar índices para melhorar performance
CREATE INDEX idx_transactions_parent ON public.transactions(parent_transaction_id) 
  WHERE parent_transaction_id IS NOT NULL;

CREATE INDEX idx_transactions_recurring ON public.transactions(is_recurring, recurrence_pattern, transaction_date) 
  WHERE is_recurring = true AND parent_transaction_id IS NULL;

CREATE INDEX idx_transactions_auto_generated ON public.transactions(is_auto_generated, parent_transaction_id) 
  WHERE is_auto_generated = true;

-- =============================================
-- ETAPA 2: CRIAR TABELA DE CONTROLE
-- =============================================

-- Tabela auxiliar para rastrear o estado de cada série recorrente
CREATE TABLE IF NOT EXISTS public.recurring_transactions_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  last_generated_date DATE NOT NULL,
  next_generation_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Garantir apenas um registro de controle por transação recorrente
  UNIQUE(parent_transaction_id)
);

-- Adicionar comentários
COMMENT ON TABLE public.recurring_transactions_control IS 'Controla o estado e próximas gerações de cada série de transações recorrentes';
COMMENT ON COLUMN public.recurring_transactions_control.last_generated_date IS 'Última data em que transações foram geradas para esta série';
COMMENT ON COLUMN public.recurring_transactions_control.next_generation_date IS 'Próxima data em que o sistema deve gerar transações';
COMMENT ON COLUMN public.recurring_transactions_control.is_active IS 'Se false, a série foi pausada/cancelada e não gera mais transações';

-- Criar índices para otimizar queries
CREATE INDEX idx_rtc_parent ON public.recurring_transactions_control(parent_transaction_id);
CREATE INDEX idx_rtc_active_next ON public.recurring_transactions_control(is_active, next_generation_date) 
  WHERE is_active = true;

-- Habilitar RLS na tabela de controle
ALTER TABLE public.recurring_transactions_control ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários só veem controle de suas próprias transações
CREATE POLICY "Users can view own recurring controls"
  ON public.recurring_transactions_control
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = recurring_transactions_control.parent_transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recurring controls"
  ON public.recurring_transactions_control
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = recurring_transactions_control.parent_transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recurring controls"
  ON public.recurring_transactions_control
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = recurring_transactions_control.parent_transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recurring controls"
  ON public.recurring_transactions_control
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = recurring_transactions_control.parent_transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_recurring_transactions_control_updated_at
  BEFORE UPDATE ON public.recurring_transactions_control
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();