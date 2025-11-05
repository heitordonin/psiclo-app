import { useState } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Download } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  organizeCategoriesHierarchy,
  type Category,
  type CategoryWithSubcategories,
} from "@/hooks/useCategories";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { BulkImportModal } from "@/components/categories/BulkImportModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CategoriesPage() {
  const [selectedTab, setSelectedTab] = useState<"income" | "expense">("expense");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>();

  const { data: categories, isLoading, isError, refetch } = useCategories("all");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const filteredCategories = categories?.filter((c) => c.type === selectedTab) || [];
  const defaultCategories = filteredCategories.filter((c) => c.is_default);
  const customCategories = filteredCategories.filter((c) => !c.is_default);

  const { parents: defaultHierarchy } = organizeCategoriesHierarchy(defaultCategories);
  const { parents: customHierarchy } = organizeCategoriesHierarchy(customCategories);

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, ...data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingCategory(undefined);
          },
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id, {
        onSuccess: () => {
          setDeletingCategory(undefined);
        },
        onError: () => {
          setDeletingCategory(undefined);
        },
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="bg-primary text-primary-foreground p-6">
          <Skeleton className="h-8 w-40 bg-primary-foreground/20" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="bg-primary text-primary-foreground p-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
        </div>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar categorias.{" "}
              <Button variant="link" onClick={() => refetch()} className="p-0 h-auto">
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "income" | "expense")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-6">
            <CategorySection
              title="Categorias Padrão"
              categories={defaultHierarchy}
              onEdit={handleEdit}
              onDelete={setDeletingCategory}
              emptyMessage="Nenhuma categoria padrão de receita"
              showDownloadButton={true}
            />
            <CategorySection
              title="Minhas Categorias"
              categories={customHierarchy}
              onEdit={handleEdit}
              onDelete={setDeletingCategory}
              emptyMessage="Nenhuma categoria personalizada. Crie a primeira!"
            />
          </TabsContent>

          <TabsContent value="expense" className="space-y-6">
            <CategorySection
              title="Categorias Padrão"
              categories={defaultHierarchy}
              onEdit={handleEdit}
              onDelete={setDeletingCategory}
              emptyMessage="Nenhuma categoria padrão de despesa"
              showDownloadButton={true}
            />
            <CategorySection
              title="Minhas Categorias"
              categories={customHierarchy}
              onEdit={handleEdit}
              onDelete={setDeletingCategory}
              emptyMessage="Nenhuma categoria personalizada. Crie a primeira!"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CategoryModal
        open={isModalOpen}
        onClose={handleModalClose}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
      />

      <BulkImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  categories: CategoryWithSubcategories[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  emptyMessage: string;
  showDownloadButton?: boolean;
}

function CategorySection({ title, categories, onEdit, onDelete, emptyMessage, showDownloadButton = false }: CategorySectionProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/Categorias_padrao.xlsx';
    link.download = 'Categorias_padrao.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {showDownloadButton && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Planilha
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showDownloadButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Planilha
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onEdit={() => onEdit(category)}
              onDelete={() => onDelete(category)}
              onEditSubcategory={onEdit}
              onDeleteSubcategory={onDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryItemProps {
  category: CategoryWithSubcategories;
  onEdit: () => void;
  onDelete: () => void;
  onEditSubcategory?: (sub: Category) => void;
  onDeleteSubcategory?: (sub: Category) => void;
  isSubcategory?: boolean;
}

function CategoryItem({ 
  category, 
  onEdit, 
  onDelete, 
  onEditSubcategory, 
  onDeleteSubcategory,
  isSubcategory = false 
}: CategoryItemProps) {
  const canEdit = !category.is_default;

  return (
    <div className={isSubcategory ? "py-2" : "p-4"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <CategoryIcon 
            icon={category.icon} 
            color={category.color} 
            size={isSubcategory ? 16 : 20} 
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={isSubcategory ? "text-sm text-muted-foreground" : "font-medium"}>
                {category.name}
              </span>
              {category.is_default && (
                <Badge variant="secondary" className="text-xs">
                  padrão
                </Badge>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
              className={isSubcategory ? "h-8 w-8" : ""}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className={isSubcategory ? "h-8 w-8" : ""}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {!isSubcategory && category.subcategories && category.subcategories.length > 0 && (
        <div className="ml-14 mt-3 space-y-1 border-l-2 border-muted pl-4">
          {category.subcategories.map((sub) => (
            <CategoryItem
              key={sub.id}
              category={sub}
              onEdit={() => onEditSubcategory?.(sub)}
              onDelete={() => onDeleteSubcategory?.(sub)}
              isSubcategory={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
