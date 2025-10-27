-- =============================================
-- RECREATE TRIGGER (garantir que usa função atualizada)
-- =============================================

-- 1. Remover trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- CRIAR FUNÇÃO RPC PARA FALLBACK
-- =============================================

-- Permite que usuários existentes populem suas próprias categorias
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