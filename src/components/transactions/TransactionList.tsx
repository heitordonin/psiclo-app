import { TransactionItem } from "./TransactionItem";
import { isToday, isYesterday, isTomorrow, parseISO, format, isFuture, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const groupByDate = (transactions: Transaction[]) => {
    const groups = new Map<string, Transaction[]>();

    transactions.forEach((transaction) => {
      const date = parseISO(transaction.transaction_date);
      let label: string;

      if (isToday(date)) {
        label = "Hoje";
      } else if (isYesterday(date)) {
        label = "Ontem";
      } else if (isTomorrow(date)) {
        label = "Amanhã";
      } else if (isFuture(date)) {
        const daysUntil = differenceInDays(date, new Date());
        if (daysUntil <= 7) {
          label = "Esta Semana";
        } else if (daysUntil <= 30) {
          label = "Este Mês";
        } else {
          label = format(date, "MMMM/yyyy", { locale: ptBR });
        }
      } else {
        label = format(date, "dd/MM/yyyy", { locale: ptBR });
      }

      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label)!.push(transaction);
    });

    return groups;
  };

  const groupedTransactions = groupByDate(transactions);

  return (
    <div className="space-y-6 pb-4">
      {Array.from(groupedTransactions.entries()).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
            {date}
          </h3>
          <div className="space-y-2">
            {items.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
