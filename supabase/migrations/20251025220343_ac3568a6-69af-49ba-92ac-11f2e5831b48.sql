-- Adicionar coluna is_default na tabela budget_categories
ALTER TABLE public.budget_categories 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Marcar categorias existentes como padrão baseado nos nomes conhecidos
UPDATE public.budget_categories 
SET is_default = true 
WHERE name IN (
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
  'Lazer', 'Outros', 'Salário', 'Freelance', 'Investimentos'
);

-- Atualizar função seed para marcar como padrão
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default) VALUES
    -- Despesas
    (p_user_id, 'Alimentação', 'expense', '#EF4444', 'Utensils', true),
    (p_user_id, 'Transporte', 'expense', '#F59E0B', 'Car', true),
    (p_user_id, 'Moradia', 'expense', '#8B5CF6', 'Home', true),
    (p_user_id, 'Saúde', 'expense', '#EC4899', 'Heart', true),
    (p_user_id, 'Educação', 'expense', '#3B82F6', 'GraduationCap', true),
    (p_user_id, 'Lazer', 'expense', '#10B981', 'Gamepad2', true),
    (p_user_id, 'Outros', 'expense', '#6B7280', 'MoreHorizontal', true),
    -- Receitas
    (p_user_id, 'Salário', 'income', '#059669', 'Banknote', true),
    (p_user_id, 'Freelance', 'income', '#06B6D4', 'Briefcase', true),
    (p_user_id, 'Investimentos', 'income', '#8B5CF6', 'TrendingUp', true)
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;