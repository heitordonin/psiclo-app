import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  transaction_date: string;
  budget_categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Transações Recentes</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/transactions')}
          className="text-primary"
        >
          Ver todas
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma transação registrada ainda
            </p>
            <Button 
              size="sm" 
              onClick={() => navigate('/transactions')}
            >
              Adicionar primeira transação
            </Button>
          </div>
        ) : (
          transactions.map((transaction) => {
            const IconComponent = transaction.budget_categories?.icon 
              ? (Icons as any)[transaction.budget_categories.icon] 
              : Icons.DollarSign;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate('/transactions')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: transaction.budget_categories?.color + "20",
                      color: transaction.budget_categories?.color,
                    }}
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.budget_categories?.name || 'Sem categoria'}
                      {' • '}
                      {formatShortDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-right font-semibold ${
                    transaction.type === "income"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(transaction.amount))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
