-- =============================================
-- ETAPA 1: RECRIAR POLÍTICAS RLS (MAIS RESTRITIVAS)
-- =============================================

-- Limpar políticas existentes
DROP POLICY IF EXISTS "Users can view own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "select_own_categories" ON public.budget_categories;
DROP POLICY IF EXISTS "insert_custom_categories" ON public.budget_categories;
DROP POLICY IF EXISTS "update_custom_categories" ON public.budget_categories;
DROP POLICY IF EXISTS "delete_custom_categories" ON public.budget_categories;

-- SELECT: apenas do próprio usuário
CREATE POLICY "select_own_categories"
  ON public.budget_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: somente categorias customizadas (is_default = false)
CREATE POLICY "insert_custom_categories"
  ON public.budget_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- UPDATE: somente categorias customizadas do próprio usuário
CREATE POLICY "update_custom_categories"
  ON public.budget_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- DELETE: somente categorias customizadas do próprio usuário
CREATE POLICY "delete_custom_categories"
  ON public.budget_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- =============================================
-- ETAPA 2: TRIGGERS DE PROTEÇÃO
-- =============================================

-- Função para prevenir modificações em categorias padrão
CREATE OR REPLACE FUNCTION public.prevent_default_category_modifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_default THEN
      RAISE EXCEPTION 'Categorias padrão não podem ser editadas';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_default THEN
      RAISE EXCEPTION 'Categorias padrão não podem ser excluídas';
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trg_prevent_update_default_categories ON public.budget_categories;
CREATE TRIGGER trg_prevent_update_default_categories
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.prevent_default_category_modifications();

-- Trigger para DELETE
DROP TRIGGER IF EXISTS trg_prevent_delete_default_categories ON public.budget_categories;
CREATE TRIGGER trg_prevent_delete_default_categories
  BEFORE DELETE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.prevent_default_category_modifications();

-- =============================================
-- ETAPA 3: ÍNDICES
-- =============================================

-- Extensão UUID (se ainda não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Índice único parcial para evitar duplicatas de categorias padrão
CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_cat_per_user
ON public.budget_categories (
  user_id,
  name,
  COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
WHERE is_default = true;

-- Índices auxiliares para performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON public.budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_parent_id ON public.budget_categories(parent_id);

-- =============================================
-- ETAPA 4: RECRIAR TRIGGER DE NOVOS USUÁRIOS
-- =============================================

-- Remover trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ETAPA 5: TORNAR handle_new_user RESILIENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  BEGIN
    -- Criar perfil
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;

    -- Popular categorias padrão automaticamente
    PERFORM public.seed_default_categories(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      -- Loga erro mas não bloqueia cadastro
      RAISE NOTICE 'handle_new_user falhou para usuário %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- =============================================
-- ETAPA 6: GARANTIR FUNÇÃO RPC FALLBACK
-- =============================================

CREATE OR REPLACE FUNCTION public.seed_default_categories_for_me()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_count int;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se já possui categorias padrão
  SELECT COUNT(*) INTO v_count
  FROM public.budget_categories
  WHERE user_id = v_user_id AND is_default = true;
  
  -- Se não tiver, popular
  IF v_count = 0 THEN
    PERFORM public.seed_default_categories(v_user_id);
    RAISE NOTICE 'Categorias padrão adicionadas para usuário %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário % já possui % categorias padrão', v_user_id, v_count;
  END IF;
END;
$$;

-- Permitir que usuários autenticados chamem a função
GRANT EXECUTE ON FUNCTION public.seed_default_categories_for_me() TO authenticated;

-- =============================================
-- ETAPA 7: BACKFILL PARA USUÁRIOS EXISTENTES
-- =============================================

DO $$
DECLARE
  u RECORD;
  has_defaults int;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    SELECT COUNT(*) INTO has_defaults
    FROM public.budget_categories
    WHERE user_id = u.id AND is_default = true;

    IF has_defaults = 0 THEN
      BEGIN
        PERFORM public.seed_default_categories(u.id);
        RAISE NOTICE 'Categorias padrão aplicadas ao usuário %', u.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Erro ao aplicar categorias para usuário %: %', u.id, SQLERRM;
      END;
    END IF;
  END LOOP;
END;
$$;