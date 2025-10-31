// Temporary adapter until we replace actual Categories page import.
// This file documents the expected usage of `categories_all` and CRUD in `categories_user`.

import { createClient } from '@supabase/supabase-js'

export async function listCategoriesAll(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from('categories_all')
    .select('*')
    .order('kind', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createUserCategory(supabase: ReturnType<typeof createClient>, payload: {
  user_id?: string;
  name: string;
  kind: 'receita' | 'despesa' | 'transferencia';
  sort_order?: number;
}) {
  const { error } = await supabase.from('categories_user').insert({
    user_id: payload.user_id,
    name: payload.name,
    kind: payload.kind,
    sort_order: payload.sort_order ?? 0,
  });
  if (error) throw error;
}

export async function updateUserCategory(supabase: ReturnType<typeof createClient>, id: string, patch: Partial<{
  name: string;
  sort_order: number;
}>) {
  const { error } = await supabase
    .from('categories_user')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteUserCategory(supabase: ReturnType<typeof createClient>, id: string) {
  const { error } = await supabase
    .from('categories_user')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
