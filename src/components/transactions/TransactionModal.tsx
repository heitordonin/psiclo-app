import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, TrendingUp, TrendingDown, Settings } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/ui/currency-input";
import { transactionSchema, type TransactionFormData } from "@/lib/validations/transaction";
import { useCategories } from "@/hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  defaultType?: 'income' | 'expense';
}

export function TransactionModal({ open, onClose, transaction, defaultType = 'expense' }: TransactionModalProps) {
  const isEditing = !!transaction;
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      transaction_date: new Date(),
      category_id: "",
      type: defaultType,
      is_recurring: false,
      recurrence_pattern: undefined,
    },
  });

  const watchType = form.watch("type");
  const watchIsRecurring = form.watch("is_recurring");
  const { data: categories } = useCategories(watchType);

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: Number(transaction.amount),
        description: transaction.description,
        transaction_date: new Date(transaction.transaction_date),
        category_id: transaction.category_id || "",
        type: transaction.type as "income" | "expense",
        is_recurring: transaction.is_recurring || false,
        recurrence_pattern: transaction.recurrence_pattern || undefined,
      });
    } else {
      form.reset({
        amount: 0,
        description: "",
        transaction_date: new Date(),
        category_id: "",
        type: defaultType,
        is_recurring: false,
        recurrence_pattern: undefined,
      });
    }
  }, [transaction, form, open]);

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    
    console.debug("[Transaction submit] date:", data.transaction_date, "type:", typeof data.transaction_date);
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          amount: data.amount,
          description: data.description,
          category_id: data.category_id,
          type: data.type,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
        });
      } else {
        await createMutation.mutateAsync({
          amount: data.amount,
          description: data.description,
          category_id: data.category_id,
          type: data.type,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          user_id: user.id,
          transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader
          className={cn(
            "transition-colors rounded-lg p-4 -mx-6 -mt-6 mb-6",
            watchType === "income" ? "bg-success/10" : "bg-destructive/10"
          )}
        >
          <SheetTitle>
            {isEditing ? "Editar" : "Adicionar"} Transação
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Toggle Income/Expense */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={watchType === "income" ? "default" : "outline"}
                className={cn("flex-1", watchType === "income" && "bg-success hover:bg-success/90")}
                onClick={() => {
                  form.setValue("type", "income");
                  form.setValue("category_id", "");
                }}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Receita
              </Button>
              <Button
                type="button"
                variant={watchType === "expense" ? "default" : "outline"}
                className={cn("flex-1", watchType === "expense" && "bg-destructive hover:bg-destructive/90")}
                onClick={() => {
                  form.setValue("type", "expense");
                  form.setValue("category_id", "");
                }}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Despesa
              </Button>
            </div>

            {/* Valor */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra no supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        required
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            form.setValue("transaction_date", date, { shouldValidate: true });
                          }
                        }}
                        disabled={(date) => startOfDay(date) > startOfDay(new Date())}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => {
                          const IconComponent = category.icon
                            ? (LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
                            : LucideIcons.DollarSign;
                          
                          return (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                {IconComponent && (
                                  <IconComponent
                                    className="h-4 w-4"
                                    style={{ color: category.color || "#059669" }}
                                  />
                                )}
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    {/* Botão Gerenciar Categorias */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        onClose();
                        navigate('/categories');
                      }}
                      title="Gerenciar categorias"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transação Recorrente */}
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Repetir transação</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Campos de recorrência */}
            {watchIsRecurring && (
              <div className="space-y-4 border-l-2 border-primary pl-4">
                <FormField
                  control={form.control}
                  name="recurrence_pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diária</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
