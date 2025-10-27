import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

// Adapter que eu adicionei no PR #3
import {
  listCategoriesAll,
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
} from '@/integrations/supabase/categoriesAllAdapter';

// Tipagem simples (pode usar seus tipos do Supabase se preferir)
type Kind = 'receita' | 'despesa' | 'transferencia';

type CategoryRow = {
  id: string;
  user_id: string | null;
  name: string;
  kind: Kind;
  sort_order: number;
  locked: boolean;       // true = padrão (template), false = do usuário
  source: 'template' | 'user';
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  // Inputs simples pra criar/editar
  const [newName, setNewName] = useState('');
  const [newKind, setNewKind] = useState<Kind>('receita');

  // Carregar tudo da view unificada
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories_all'],
    queryFn: async () => {
      const rows = (await listCategoriesAll(supabase)) as CategoryRow[];
      return rows;
    },
    staleTime: 30_000,
  });

  const categories = data ?? [];

  const receitas = useMemo(
    () => categories.filter((c) => c.kind === 'receita'),
    [categories],
  );
  const despesas = useMemo(
    () => categories.filter((c) => c.kind === 'despesa'),
    [categories],
  );
  const transfer = useMemo(
    () => categories.filter((c) => c.kind === 'transferencia'),
    [categories],
  );

  async function handleCreate() {
    try {
      if (!newName.trim()) {
        toast.error('Informe um nome');
        return;
      }
      await createUserCategory(supabase, {
        name: newName.trim(),
        kind: newKind,
        sort_order: 0,
      });
      setNewName('');
      await queryClient.invalidateQueries({ queryKey: ['categories_all'] });
      toast.success('Categoria criada');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao criar categoria');
    }
  }

  async function handleRename(row: CategoryRow) {
    if (row.locked) {
      toast.info('Categorias padrão não podem ser editadas.');
      return;
    }
    const name = prompt('Novo nome da categoria:', row.name);
    if (!name || !name.trim()) return;

    try {
      await updateUserCategory(supabase, row.id, { name: name.trim() });
      await queryClient.invalidateQueries({ queryKey: ['categories_all'] });
      toast.success('Categoria atualizada');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao atualizar');
    }
  }

  async function handleDelete(row: CategoryRow) {
    if (row.locked) {
      toast.info('Categorias padrão não podem ser excluídas.');
      return;
    }
    const ok = confirm(`Excluir a categoria "${row.name}"?`);
    if (!ok) return;

    try {
      await deleteUserCategory(supabase, row.id);
      await queryClient.invalidateQueries({ queryKey: ['categories_all'] });
      toast.success('Categoria excluída');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao excluir');
    }
  }

  if (isLoading) return <div>Carregando categorias...</div>;
  if (isError) return <div>Erro ao carregar. <button onClick={() => refetch()}>Tentar novamente</button></div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Categorias</h1>

      {/* Criar categoria do usuário */}
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Nome</label>
          <input
            className="border rounded p-2 min-w-[240px] bg-background"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex.: Marketing, Aluguel, etc."
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Tipo</label>
          <select
            className="border rounded p-2 bg-background"
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as Kind)}
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
            <option value="transferencia">Transferência</option>
          </select>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 rounded bg-primary text-primary-foreground">
          Adicionar
        </button>
      </div>

      {/* Listagens */}
      <Section
        title="Receitas"
        rows={receitas}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <Section
        title="Despesas"
        rows={despesas}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <Section
        title="Transferências"
        rows={transfer}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  );
}

function Section({
  title,
  rows,
  onRename,
  onDelete,
}: {
  title: string;
  rows: CategoryRow[];
  onRename: (row: CategoryRow) => void;
  onDelete: (row: CategoryRow) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-medium mb-3">{title}</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Bloqueada</th>
              <th className="text-right p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={3}>
                  Nenhuma categoria
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const canEdit = !row.locked;
              const canDelete = !row.locked;
              return (
                <tr key={`${row.source}-${row.id}`} className="border-t">
                  <td className="p-2 align-middle">
                    {row.name}
                    {row.locked && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted-foreground/10">padrão</span>}
                  </td>
                  <td className="p-2 align-middle">{row.locked ? 'Sim' : 'Não'}</td>
                  <td className="p-2 align-middle">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => onRename(row)}
                        disabled={!canEdit}
                        title={row.locked ? 'Categoria padrão não pode ser editada' : 'Editar'}
                      >
                        Editar
                      </button>
                      <button
                        className="px-2 py-1 border rounded disabled:opacity-50"
                        onClick={() => onDelete(row)}
                        disabled={!canDelete}
                        title={row.locked ? 'Categoria padrão não pode ser excluída' : 'Excluir'}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
