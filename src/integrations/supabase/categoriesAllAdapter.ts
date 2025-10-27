import { SupabaseClient } from '@supabase/supabase-js';

type Kind = 'receita' | 'despesa' | 'transferencia';

export async function listCategoriesAll(client: SupabaseClient) {
  const { data, error } = await client
    .from('categories_all')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createUserCategory(
  client: SupabaseClient,
  params: {
    name: string;
    kind: Kind;
    sort_order: number;
  }
) {
  const { data, error } = await client
    .from('budget_categories')
    .insert({
      name: params.name,
      type: params.kind === 'receita' ? 'income' : params.kind === 'despesa' ? 'expense' : 'income',
      color: '#6B7280',
      icon: 'Folder',
      is_default: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserCategory(
  client: SupabaseClient,
  categoryId: string,
  updates: { name?: string }
) {
  const { data, error } = await client
    .from('budget_categories')
    .update(updates)
    .eq('id', categoryId)
    .eq('is_default', false)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserCategory(
  client: SupabaseClient,
  categoryId: string
) {
  const { error } = await client
    .from('budget_categories')
    .delete()
    .eq('id', categoryId)
    .eq('is_default', false);

  if (error) throw error;
}
