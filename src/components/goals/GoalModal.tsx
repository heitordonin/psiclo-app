import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { type Currency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";

type FinancialGoal = Database["public"]["Tables"]["financial_goals"]["Row"];

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  target_amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  target_date: z.string().optional().refine(
    (date) => !date || new Date(date) > new Date(),
    { message: "Data deve ser futura" }
  ),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  goal?: FinancialGoal;
  open: boolean;
  onClose: () => void;
  onSave: (data: { 
    name: string; 
    currency: string; 
    target_amount: number; 
    target_date?: string; 
    goal_type: string;
  }) => void;
}

export function GoalModal({ goal, open, onClose, onSave }: GoalModalProps) {
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      currency: (goal?.currency as Currency) || 'BRL',
      target_amount: goal ? Number(goal.target_amount) : 0,
      target_date: goal?.target_date || "",
    },
  });

  const handleSubmit = (data: GoalFormData) => {
    onSave({ 
      name: data.name, 
      currency: data.currency, 
      target_amount: data.target_amount, 
      target_date: data.target_date, 
      goal_type: 'custom' 
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Férias 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!goal}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">
                        🇧🇷 Real (R$)
                      </SelectItem>
                      <SelectItem value="USD">
                        🇺🇸 Dólar ($)
                      </SelectItem>
                      <SelectItem value="EUR">
                        🇪🇺 Euro (€)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => {
                const selectedCurrency = form.watch('currency') as Currency;
                return (
                  <FormItem>
                    <FormLabel>Valor Alvo</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={(value) => field.onChange(value || 0)}
                        currency={selectedCurrency}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Alvo</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      min={format(new Date(), "yyyy-MM-dd")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
