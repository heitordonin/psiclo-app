import { z } from "zod";
import { startOfDay } from "date-fns";

export const transactionSchema = z.object({
  amount: z
    .number({
      required_error: "Valor é obrigatório",
      invalid_type_error: "Valor deve ser um número",
    })
    .positive("Valor deve ser maior que zero"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(100, "Máximo 100 caracteres"),
  transaction_date: z.coerce.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  category_id: z.string().uuid("Categoria é obrigatória"),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
  }),
  is_recurring: z.boolean().optional().default(false),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrence_end_date: z.coerce.date().optional(),
  recurrence_count: z.number().int().positive().max(365, "Máximo 365 repetições").optional(),
}).refine(
  (data) => {
    // Se is_recurring = true, deve ter pattern E (end_date OU count)
    if (data.is_recurring) {
      const hasPattern = !!data.recurrence_pattern;
      const hasEndCondition = !!data.recurrence_end_date || (data.recurrence_count !== undefined && data.recurrence_count > 0);
      return hasPattern && hasEndCondition;
    }
    return true;
  },
  {
    message: "Transações recorrentes precisam de frequência e condição de término (data ou número de repetições)",
    path: ["recurrence_pattern"]
  }
).refine(
  (data) => {
    // Se tem end_date, deve ser posterior à transaction_date
    if (data.recurrence_end_date && data.transaction_date) {
      return startOfDay(data.recurrence_end_date) > startOfDay(data.transaction_date);
    }
    return true;
  },
  {
    message: "Data de término deve ser posterior à data da transação",
    path: ["recurrence_end_date"]
  }
);

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(30, "Máximo 30 caracteres"),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
  }),
  icon: z.string().min(1, "Ícone é obrigatório"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor inválida")
    .min(1, "Cor é obrigatória"),
  parent_id: z.string().uuid().optional().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
