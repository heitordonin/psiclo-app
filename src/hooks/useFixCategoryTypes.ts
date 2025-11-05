import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Normaliza um nome de categoria removendo acentos e convertendo para minúsculas
 */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Lista de nomes que devem ser categorias de receita (income)
 */
const KNOWN_INCOME_NAMES = ['salario', 'salary', 'doacao', 'donation'];

/**
 * Verifica se um nome corresponde a uma categoria de receita conhecida
 */
export function isKnownIncomeName(name: string): boolean {
  const normalized = normalizeName(name);
  return KNOWN_INCOME_NAMES.includes(normalized);
}

/**
 * Corrige categorias que foram salvas com o tipo errado no banco de dados
 * (ex: "Salário" salvo como expense quando deveria ser income)
 */
export async function fixMisTypedIncomeCategories(): Promise<void> {
  try {
    // Buscar todas as categorias do usuário com type='expense'
    const { data: categories, error: fetchError } = await supabase
      .from('budget_categories')
      .select('id, name, type')
      .eq('type', 'expense');

    if (fetchError) {
      console.error('Erro ao buscar categorias:', fetchError);
      return;
    }

    if (!categories || categories.length === 0) {
      return;
    }

    // Filtrar categorias que deveriam ser receita
    const misTypedCategories = categories.filter(cat => 
      isKnownIncomeName(cat.name)
    );

    if (misTypedCategories.length === 0) {
      console.debug('Nenhuma categoria com tipo incorreto encontrada');
      return;
    }

    // Atualizar o tipo dessas categorias para 'income'
    const idsToFix = misTypedCategories.map(cat => cat.id);
    
    const { error: updateError } = await supabase
      .from('budget_categories')
      .update({ type: 'income' })
      .in('id', idsToFix);

    if (updateError) {
      console.error('Erro ao corrigir tipos de categorias:', updateError);
      return;
    }

    console.debug(`Corrigidos ${misTypedCategories.length} categorias de receita que estavam como despesa:`, 
      misTypedCategories.map(c => c.name));

    toast({
      title: "Categorias corrigidas",
      description: `Ajustamos ${misTypedCategories.length} categoria(s) de receita que estavam incorretas.`,
    });

  } catch (error) {
    console.error('Erro inesperado ao corrigir categorias:', error);
  }
}
