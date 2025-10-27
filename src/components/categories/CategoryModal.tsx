import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories } from "@/hooks/useCategories";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import { categorySchema, type CategoryFormData } from "@/lib/validations/transaction";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
}

export function CategoryModal({ 
  open, 
  onClose, 
  category,
  onSubmit 
}: CategoryModalProps) {
  const isEditing = !!category;
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      icon: "Wallet",
      color: "#059669",
      parent_id: undefined,
    },
  });

  const watchType = form.watch("type");
  const { data: parentCategories } = useCategories(watchType);

  // Popular form ao editar
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        type: category.type as "income" | "expense",
        icon: category.icon || "Wallet",
        color: category.color || "#059669",
        parent_id: category.parent_id || undefined,
      });
    } else {
      form.reset({
        name: "",
        type: "expense",
        icon: "Wallet",
        color: "#059669",
        parent_id: undefined,
      });
    }
  }, [category, form, open]);

  const handleSubmit = (data: CategoryFormData) => {
    const submitData = {
      ...data,
      parent_id: data.parent_id === "none" ? null : data.parent_id
    };
    onSubmit(submitData);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Alimentação" 
                      maxLength={30}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo (Receita/Despesa) */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("parent_id", undefined);
                      }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <RadioGroupItem
                          value="income"
                          id="income"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="income"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-success [&:has([data-state=checked])]:border-success"
                        >
                          <span className="text-sm font-medium">Receita</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="expense"
                          id="expense"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="expense"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive"
                        >
                          <span className="text-sm font-medium">Despesa</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subcategoria de */}
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria de</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem categoria pai" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria pai</SelectItem>
                      {parentCategories
                        ?.filter(cat => !cat.parent_id && cat.id !== category?.id)
                        ?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seletor de Ícone */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seletor de Cor */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar alterações" : "Criar categoria"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
