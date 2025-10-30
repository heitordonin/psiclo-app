import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";

interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
}

export function BudgetSummary({
  totalBudget,
  totalSpent,
  remaining,
}: BudgetSummaryProps) {
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const getStatusColor = () => {
    if (percentageUsed > 100) return "text-destructive";
    if (percentageUsed > 80) return "text-orange-500";
    return "text-success";
  };

  const getProgressColor = () => {
    if (percentageUsed > 100) return "bg-destructive";
    if (percentageUsed > 80) return "bg-orange-500";
    return "bg-success";
  };

  return (
    <Card className="m-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com percentual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orçamento do Mês</p>
              <p className="text-xs text-muted-foreground/70 italic mb-1">
                Soma automática das metas individuais
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <div className={`text-3xl font-bold ${getStatusColor()}`}>
              {Math.round(percentageUsed)}%
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <Progress 
              value={Math.min(percentageUsed, 100)} 
              className="h-3"
              indicatorClassName={getProgressColor()}
            />
            {percentageUsed > 100 && (
              <p className="text-xs text-destructive font-medium">
                Orçamento excedido em {formatCurrency(totalSpent - totalBudget)}
              </p>
            )}
          </div>

          {/* Detalhamento */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gasto</p>
              <p className="text-lg font-semibold text-destructive">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {remaining >= 0 ? "Disponível" : "Excedido"}
              </p>
              <p
                className={`text-lg font-semibold ${
                  remaining >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
