-- =============================================
-- ATUALIZAR TRIGGER handle_new_user
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Popular categorias padrão automaticamente
  PERFORM public.seed_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- =============================================
-- REESCREVER FUNÇÃO seed_default_categories
-- =============================================

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_alimentacao_id UUID;
  v_assinatura_id UUID;
  v_automovel_id UUID;
  v_educacao_id UUID;
  v_lazer_id UUID;
  v_moradia_id UUID;
  v_pessoais_id UUID;
  v_saude_id UUID;
  v_seguros_id UUID;
  v_transporte_id UUID;
  v_viagem_id UUID;
BEGIN
  -- =============================================
  -- ETAPA 1: INSERIR CATEGORIAS MÃE (DESPESAS)
  -- =============================================
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Alimentação', 'expense', '#EF4444', 'Utensils', true)
  RETURNING id INTO v_alimentacao_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Assinatura', 'expense', '#A855F7', 'FileText', true)
  RETURNING id INTO v_assinatura_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Automóvel', 'expense', '#F59E0B', 'Car', true)
  RETURNING id INTO v_automovel_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Bem Estar', 'expense', '#EC4899', 'Sparkles', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Educação', 'expense', '#3B82F6', 'GraduationCap', true)
  RETURNING id INTO v_educacao_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Impostos e Tarifas', 'expense', '#DC2626', 'Receipt', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Lazer', 'expense', '#10B981', 'Gamepad2', true)
  RETURNING id INTO v_lazer_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Moradia', 'expense', '#8B5CF6', 'Home', true)
  RETURNING id INTO v_moradia_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Pessoais', 'expense', '#6B7280', 'User', true)
  RETURNING id INTO v_pessoais_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Saúde', 'expense', '#EC4899', 'Heart', true)
  RETURNING id INTO v_saude_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Seguros', 'expense', '#0EA5E9', 'Shield', true)
  RETURNING id INTO v_seguros_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Telefonia', 'expense', '#14B8A6', 'Phone', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Trabalho', 'expense', '#059669', 'Briefcase', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Transporte', 'expense', '#F59E0B', 'Bus', true)
  RETURNING id INTO v_transporte_id;
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Vestuário', 'expense', '#D946EF', 'Shirt', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Viagem', 'expense', '#06B6D4', 'Plane', true)
  RETURNING id INTO v_viagem_id;
  
  -- =============================================
  -- ETAPA 2: INSERIR CATEGORIAS MÃE (RECEITAS)
  -- =============================================
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Salário', 'income', '#059669', 'Banknote', true);
  
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default)
  VALUES (p_user_id, 'Doação', 'income', '#10B981', 'Heart', true);
  
  -- =============================================
  -- ETAPA 3: INSERIR SUBCATEGORIAS
  -- =============================================
  
  -- Alimentação (2 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'iFood', 'expense', '#F87171', 'Pizza', true, v_alimentacao_id),
    (p_user_id, 'Restaurante', 'expense', '#DC2626', 'UtensilsCrossed', true, v_alimentacao_id);
  
  -- Assinatura (2 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Netflix', 'expense', '#C084FC', 'Tv', true, v_assinatura_id),
    (p_user_id, 'Spotify', 'expense', '#9333EA', 'Music', true, v_assinatura_id);
  
  -- Automóvel (4 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Combustível', 'expense', '#FB923C', 'Fuel', true, v_automovel_id),
    (p_user_id, 'Seguro do veículo', 'expense', '#EA580C', 'Shield', true, v_automovel_id),
    (p_user_id, 'Manutenção', 'expense', '#C2410C', 'Wrench', true, v_automovel_id),
    (p_user_id, 'IPVA', 'expense', '#92400E', 'FileText', true, v_automovel_id);
  
  -- Educação (2 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Faculdade', 'expense', '#60A5FA', 'School', true, v_educacao_id),
    (p_user_id, 'Cursos livres', 'expense', '#2563EB', 'BookOpen', true, v_educacao_id);
  
  -- Lazer (1 subcategoria)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Festa', 'expense', '#34D399', 'PartyPopper', true, v_lazer_id);
  
  -- Moradia (6 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Aluguel', 'expense', '#A78BFA', 'Home', true, v_moradia_id),
    (p_user_id, 'Condomínio', 'expense', '#7C3AED', 'Building2', true, v_moradia_id),
    (p_user_id, 'Gás', 'expense', '#6D28D9', 'Flame', true, v_moradia_id),
    (p_user_id, 'Internet', 'expense', '#5B21B6', 'Wifi', true, v_moradia_id),
    (p_user_id, 'Luz', 'expense', '#4C1D95', 'Lightbulb', true, v_moradia_id),
    (p_user_id, 'Mercado', 'expense', '#7E22CE', 'ShoppingCart', true, v_moradia_id);
  
  -- Pessoais (2 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Celular', 'expense', '#9CA3AF', 'Smartphone', true, v_pessoais_id),
    (p_user_id, 'Compras gerais', 'expense', '#4B5563', 'ShoppingBag', true, v_pessoais_id);
  
  -- Saúde (5 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Plano de Saúde', 'expense', '#F472B6', 'HeartPulse', true, v_saude_id),
    (p_user_id, 'Dentista', 'expense', '#DB2777', 'BadgeCheck', true, v_saude_id),
    (p_user_id, 'Farmácia', 'expense', '#BE185D', 'Pill', true, v_saude_id),
    (p_user_id, 'Psicóloga', 'expense', '#9F1239', 'Brain', true, v_saude_id),
    (p_user_id, 'Médico', 'expense', '#881337', 'Stethoscope', true, v_saude_id);
  
  -- Seguros (1 subcategoria)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Seguro de Vida', 'expense', '#38BDF8', 'HeartHandshake', true, v_seguros_id);
  
  -- Transporte (1 subcategoria)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Uber', 'expense', '#FB923C', 'Car', true, v_transporte_id);
  
  -- Viagem (3 subcategorias)
  INSERT INTO public.budget_categories (user_id, name, type, color, icon, is_default, parent_id)
  VALUES 
    (p_user_id, 'Hospedagem', 'expense', '#22D3EE', 'Hotel', true, v_viagem_id),
    (p_user_id, 'Passagem', 'expense', '#0891B2', 'Ticket', true, v_viagem_id),
    (p_user_id, 'Transporte', 'expense', '#0E7490', 'Bus', true, v_viagem_id);
  
EXCEPTION
  WHEN unique_violation THEN
    -- Ignorar se categorias já existem
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- =============================================
-- POPULAR CATEGORIAS EM USUÁRIOS EXISTENTES
-- =============================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users
  LOOP
    -- Verificar se usuário já tem categorias padrão
    IF NOT EXISTS (
      SELECT 1 FROM public.budget_categories 
      WHERE user_id = user_record.id AND is_default = true
      LIMIT 1
    ) THEN
      -- Popular categorias padrão
      PERFORM public.seed_default_categories(user_record.id);
    END IF;
  END LOOP;
END $$;