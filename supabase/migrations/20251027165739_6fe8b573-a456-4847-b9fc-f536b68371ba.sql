-- =============================================
-- POPULAR CATEGORIAS NOS USUÁRIOS EXISTENTES
-- (Correção do script anterior que não foi executado)
-- =============================================

DO $$
DECLARE
  user_record RECORD;
  category_count INTEGER;
BEGIN
  -- Iterar sobre todos os usuários
  FOR user_record IN 
    SELECT id FROM auth.users
  LOOP
    -- Contar quantas categorias padrão o usuário já tem
    SELECT COUNT(*) INTO category_count
    FROM public.budget_categories 
    WHERE user_id = user_record.id AND is_default = true;
    
    -- Se não tiver nenhuma categoria padrão, popular
    IF category_count = 0 THEN
      RAISE NOTICE 'Populando categorias para usuário: %', user_record.id;
      PERFORM public.seed_default_categories(user_record.id);
    ELSE
      RAISE NOTICE 'Usuário já possui % categorias padrão', category_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Script de backfill concluído com sucesso';
END $$;