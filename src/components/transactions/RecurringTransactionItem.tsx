import { Trash2, Calendar, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type RecurringTransaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface RecurringTransactionItemProps {
  transaction: RecurringTransaction;
  onDelete: (id: string) => void;
}

const patternLabels: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function RecurringTransactionItem({ transaction, onDelete }: RecurringTransactionItemProps) {
  const IconComponent = transaction.budget_categories?.icon
    ? (LucideIcons[transaction.budget_categories.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : LucideIcons.DollarSign;

  return (
    <div className="relative bg-background border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Ícone da categoria */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${transaction.budget_categories?.color}20` }}
        >
          <IconComponent
            className="h-5 w-5"
            style={{ color: transaction.budget_categories?.color || "#059669" }}
          />
        </div>

        {/* Descrição e categoria */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{transaction.description}</p>
            <Badge variant="outline" className="gap-1">
              <Repeat className="h-3 w-3" />
              <span className="text-xs">{transaction.recurrence_pattern ? patternLabels[transaction.recurrence_pattern] : "N/A"}</span>
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground truncate mb-2">
            {transaction.budget_categories?.name || "Sem categoria"}
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Início: {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {transaction.recurrence_end_date && (
              <span className="flex items-center gap-1">
                • Fim: {format(new Date(transaction.recurrence_end_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
            {transaction.recurrence_count && (
              <span>
                • {transaction.recurrence_count}x
              </span>
            )}
          </div>
        </div>

        {/* Valor e ações */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p
            className={cn(
              "font-semibold",
              transaction.type === "income" ? "text-success" : "text-destructive"
            )}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="p-2 rounded-full hover:bg-destructive/10 transition-colors group"
            title="Desativar recorrência"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
