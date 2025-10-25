import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";
import * as LucideIcons from "lucide-react";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => setShowDelete(true),
    onSwipedRight: () => setShowDelete(false),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  const IconComponent = transaction.budget_categories?.icon
    ? (LucideIcons[transaction.budget_categories.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : LucideIcons.DollarSign;

  return (
    <div className="relative overflow-hidden">
      {/* Background do delete */}
      <div
        className={cn(
          "absolute inset-0 bg-destructive flex items-center justify-end px-6 transition-opacity",
          showDelete ? "opacity-100" : "opacity-0"
        )}
      >
        <Trash2 className="h-5 w-5 text-destructive-foreground" />
      </div>

      {/* Conteúdo principal */}
      <div
        {...handlers}
        className={cn(
          "relative bg-background border rounded-lg p-4 transition-transform cursor-pointer hover:bg-muted/50",
          showDelete && "-translate-x-20"
        )}
        onClick={() => !showDelete && onEdit(transaction)}
      >
        <div className="flex items-center gap-3">
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
            <p className="font-medium truncate">{transaction.description}</p>
            <p className="text-sm text-muted-foreground truncate">
              {transaction.budget_categories?.name || "Sem categoria"}
            </p>
          </div>

          {/* Valor e data */}
          <div className="text-right flex-shrink-0">
            <p
              className={cn(
                "font-semibold",
                transaction.type === "income" ? "text-success" : "text-destructive"
              )}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatShortDate(transaction.transaction_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Botão de deletar visível no swipe */}
      {showDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-destructive-foreground z-10"
        >
          Excluir
        </button>
      )}
    </div>
  );
}
