import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import type { Database } from "@/integrations/supabase/types";
import type { CategoryFormData } from "@/lib/validations/transaction";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

export default function Categories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories("all");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category?: Category;
  }>({ isOpen: false });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category?: Category;
  }>({ isOpen: false });

  // Separar categorias padrão e personalizadas
  const defaultCategories = categories?.filter(c => c.is_default) || [];
  const customCategories = categories?.filter(c => !c.is_default) || [];

  // Auto-backfill: popular categorias padrão se não existirem
  useEffect(() => {
    if (!isLoading && defaultCategories.length === 0) {
      const backfillCategories = async () => {
        try {
          await supabase.rpc('seed_default_categories_for_me');
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          toast.success('Categorias padrão adicionadas');
        } catch (error) {
          console.error('Erro ao adicionar categorias padrão:', error);
        }
      };
      backfillCategories();
    }
  }, [isLoading, defaultCategories.length, queryClient]);

  const handleCreate = () => {
    setModalState({ isOpen: true, category: undefined });
  };

  const handleEdit = (category: Category) => {
    if (category.is_default) {
      return; // Não permite editar categorias padrão
    }
    setModalState({ isOpen: true, category });
  };

  const handleDeleteClick = (category: Category) => {
    if (category.is_default) {
      return; // Não permite deletar categorias padrão
    }
    setDeleteDialog({ isOpen: true, category });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.category) {
      await deleteMutation.mutateAsync(deleteDialog.category.id);
      setDeleteDialog({ isOpen: false, category: undefined });
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (modalState.category) {
      await updateMutation.mutateAsync({
        id: modalState.category.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-primary px-4 pb-6 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">
            Categorias
          </h1>
        </div>
        <p className="text-primary-foreground/80 text-sm pl-12">
          Gerencie suas categorias de receitas e despesas
        </p>
      </div>

      <div className="space-y-6 px-4 pt-4">
        {/* Categorias Padrão */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Categorias Padrão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {defaultCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isDefault
              />
            ))}
          </CardContent>
        </Card>

        {/* Categorias Personalizadas */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Minhas Categorias</CardTitle>
            <Button
              size="sm"
              onClick={handleCreate}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {customCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  Você ainda não criou categorias personalizadas
                </p>
                <Button size="sm" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Criar primeira categoria
                </Button>
              </div>
            ) : (
              customCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  isDefault={false}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAB Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
        onClick={handleCreate}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal de Categoria */}
      <CategoryModal
        open={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, category: undefined })}
        category={modalState.category}
        onSubmit={handleSubmit}
      />

      {/* Dialog de Confirmação */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ isOpen: false, category: undefined })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}

// Componente de item de categoria
interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDefault: boolean;
}

function CategoryItem({ 
  category, 
  onEdit, 
  onDelete, 
  isDefault 
}: CategoryItemProps) {
  const [showActions, setShowActions] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => !isDefault && setShowActions(true),
    onSwipedRight: () => setShowActions(false),
    trackMouse: false,
  });

  return (
    <div {...handlers} className="relative overflow-hidden">
      {/* Background de ações */}
      {showActions && !isDefault && (
        <div className="absolute inset-0 bg-destructive flex items-center justify-end px-4">
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </div>
      )}

      {/* Conteúdo principal */}
      <div
        className={`relative bg-background flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-all ${
          showActions ? "-translate-x-20" : "translate-x-0"
        }`}
        onClick={() => !isDefault && onEdit(category)}
      >
        <div className="flex items-center gap-3">
          <CategoryIcon
            icon={category.icon || "Wallet"}
            color={category.color || "#059669"}
            size={20}
          />
          <div>
            <p className="font-medium text-sm">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              {category.type === "income" ? "Receita" : "Despesa"}
            </p>
          </div>
        </div>

        {!isDefault && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Botão de delete revelado no swipe */}
      {showActions && !isDefault && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
          onClick={() => onDelete(category)}
        >
          Excluir
        </Button>
      )}
    </div>
  );
}
