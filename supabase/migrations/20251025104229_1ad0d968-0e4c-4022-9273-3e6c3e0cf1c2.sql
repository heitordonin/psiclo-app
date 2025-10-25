-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Criar tabela de categorias de orçamento
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  budgeted_amount DECIMAL(10,2) DEFAULT 0,
  color TEXT DEFAULT '#059669',
  icon TEXT DEFAULT 'DollarSign',
  parent_id UUID REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Habilitar RLS na tabela budget_categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budget_categories
CREATE POLICY "Users can view own categories" ON public.budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.budget_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('weekly', 'monthly', 'annual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela de orçamentos mensais
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  planned_amount DECIMAL(10,2) NOT NULL,
  actual_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Habilitar RLS na tabela budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela de metas financeiras
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('retirement', 'emergency_fund', 'investment', 'custom')),
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela financial_goals
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para financial_goals
CREATE POLICY "Users can view own goals" ON public.financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para popular categorias padrão
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.budget_categories (user_id, name, type, color, icon) VALUES
    -- Despesas
    (p_user_id, 'Alimentação', 'expense', '#EF4444', 'Utensils'),
    (p_user_id, 'Transporte', 'expense', '#F59E0B', 'Car'),
    (p_user_id, 'Moradia', 'expense', '#8B5CF6', 'Home'),
    (p_user_id, 'Saúde', 'expense', '#EC4899', 'Heart'),
    (p_user_id, 'Educação', 'expense', '#3B82F6', 'GraduationCap'),
    (p_user_id, 'Lazer', 'expense', '#10B981', 'Gamepad2'),
    (p_user_id, 'Outros', 'expense', '#6B7280', 'MoreHorizontal'),
    -- Receitas
    (p_user_id, 'Salário', 'income', '#059669', 'Banknote'),
    (p_user_id, 'Freelance', 'income', '#06B6D4', 'Briefcase'),
    (p_user_id, 'Investimentos', 'income', '#8B5CF6', 'TrendingUp')
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();