import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { CategoryFormData } from "@/lib/validations/transaction";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

export type CategoryWithSubcategories = Category & {
  subcategories?: Category[];
};

export function organizeCategoriesHierarchy(categories: Category[]): {
  parents: CategoryWithSubcategories[];
  all: Category[];
} {
  const parents = categories.filter(cat => !cat.parent_id);
  const children = categories.filter(cat => cat.parent_id);

  const parentsWithSubs = parents.map(parent => ({
    ...parent,
    subcategories: children.filter(child => child.parent_id === parent.id)
  }));

  return {
    parents: parentsWithSubs,
    all: categories
  };
}

export function formatCategoryName(category: Category, allCategories: Category[]): string {
  if (!category.parent_id) {
    return category.name;
  }
  
  const parent = allCategories.find(c => c.id === category.parent_id);
  return parent ? `${parent.name}/${category.name}` : category.name;
}

export function useCategories(type?: "income" | "expense" | "all") {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      let query = supabase
        .from("budget_categories")
        .select("*")
        .order("name");

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useParentCategories(type?: "income" | "expense" | "all") {
  return useQuery({
    queryKey: ["parent-categories", type],
    queryFn: async () => {
      let query = supabase
        .from("budget_categories")
        .select("*")
        .is("parent_id", null)
        .order("name");

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// CREATE
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar limite de categorias (50 total)
      const { count } = await supabase
        .from("budget_categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count && count >= 50) {
        throw new Error("Você atingiu o limite de 50 categorias");
      }

      const { data: category, error } = await supabase
        .from("budget_categories")
        .insert([
          {
            name: data.name,
            type: data.type,
            icon: data.icon,
            color: data.color,
            parent_id: data.parent_id || null,
            user_id: user.id,
            is_default: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// UPDATE
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & CategoryFormData) => {
      const { error } = await supabase
        .from("budget_categories")
        .update({
          name: data.name,
          type: data.type,
          icon: data.icon,
          color: data.color,
          parent_id: data.parent_id || null,
        })
        .eq("id", id)
        .eq("is_default", false); // Apenas personalizadas podem ser editadas

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Categoria atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar categoria");
    },
  });
}

// DELETE
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar se tem subcategorias vinculadas
      const { count: subcategoryCount } = await supabase
        .from("budget_categories")
        .select("*", { count: "exact", head: true })
        .eq("parent_id", id);

      if (subcategoryCount && subcategoryCount > 0) {
        throw new Error(
          `Esta categoria possui ${subcategoryCount} subcategoria(s) vinculada(s) e não pode ser excluída`
        );
      }

      // Verificar se tem transações vinculadas
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (count && count > 0) {
        throw new Error(
          `Esta categoria possui ${count} transação(ões) vinculada(s) e não pode ser excluída`
        );
      }

      // Verificar se é categoria padrão
      const { data: category } = await supabase
        .from("budget_categories")
        .select("is_default")
        .eq("id", id)
        .single();

      if (category?.is_default) {
        throw new Error("Categorias padrão não podem ser excluídas");
      }

      const { error } = await supabase
        .from("budget_categories")
        .delete()
        .eq("id", id)
        .eq("is_default", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
