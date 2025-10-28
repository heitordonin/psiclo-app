-- Remove trigger existente se houver (para garantir que estamos criando do zero)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Cria o trigger que vai popular categorias automaticamente após signup
-- Este trigger chama handle_new_user() que já existe e tem SECURITY DEFINER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();