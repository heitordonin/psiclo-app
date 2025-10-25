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
  transaction_date: z.date({
    required_error: "Data é obrigatória",
  }).refine(
    (date) => startOfDay(date) <= startOfDay(new Date()),
    { message: "Data não pode ser futura" }
  ),
  category_id: z.string().uuid("Categoria é obrigatória"),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
  }),
  is_recurring: z.boolean().optional().default(false),
  recurrence_pattern: z.string().optional(),
});

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
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
