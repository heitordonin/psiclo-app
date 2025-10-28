import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBudgets, useMonthlySpending } from "@/hooks/useBudget";
import { formatCurrency } from "@/lib/formatters";
import { Wallet } from "lucide-react";
import { startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetOverview() {
  const currentMonth = startOfMonth(new Date());
  const { data: budgetData, isLoading: budgetLoading } = useBudgets(currentMonth);
  const { data: spendingData, isLoading: spendingLoading } = useMonthlySpending(currentMonth);

  const isLoading = budgetLoading || spendingLoading;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-2 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  const totalBudget = budgetData?.totalPlanned ?? 0;
  const totalSpent = spendingData?.total ?? 0;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Orçamento do Mês</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
        </div>
      </div>

      <Progress value={percentage} className="h-2 mb-2" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Gasto: {formatCurrency(totalSpent)} ({percentage.toFixed(0)}%)
        </span>
        <span className={remaining >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
          {remaining >= 0 ? "Restam" : "Excedeu"} {formatCurrency(Math.abs(remaining))}
        </span>
      </div>
    </Card>
  );
}
