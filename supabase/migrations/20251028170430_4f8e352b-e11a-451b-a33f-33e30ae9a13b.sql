-- Remover a constraint CHECK do goal_type
ALTER TABLE public.financial_goals 
  DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

-- Tornar goal_type nullable
ALTER TABLE public.financial_goals 
  ALTER COLUMN goal_type DROP NOT NULL;

-- Definir valor padrão
ALTER TABLE public.financial_goals 
  ALTER COLUMN goal_type SET DEFAULT 'custom';