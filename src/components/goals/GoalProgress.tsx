import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  currentAmount: number;
  targetAmount: number;
  targetDate?: string;
}

export function GoalProgress({ currentAmount, targetAmount, targetDate }: GoalProgressProps) {
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const remaining = targetAmount - currentAmount;

  const getProgressColor = () => {
    if (progress >= 100) return "bg-success";
    if (progress >= 80) return "bg-warning";
    return "bg-primary";
  };

  const daysRemaining = targetDate 
    ? differenceInDays(new Date(targetDate), new Date())
    : null;

  return (
    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Valor Atual</span>
          <span className="text-3xl font-bold">{formatCurrency(currentAmount)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Meta</span>
          <span className="text-xl font-semibold text-muted-foreground">
            {formatCurrency(targetAmount)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Progress 
          value={progress} 
          className="h-4"
          indicatorClassName={getProgressColor()}
        />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{progress.toFixed(1)}% alcançado</span>
          {remaining > 0 && (
            <span className="font-medium text-muted-foreground">
              Faltam {formatCurrency(remaining)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {targetDate && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Data Alvo</p>
              <p className="text-sm font-medium">
                {format(new Date(targetDate), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        )}
        
        {daysRemaining !== null && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium">
                {daysRemaining > 0 
                  ? `${daysRemaining} dias`
                  : daysRemaining === 0
                  ? "Hoje"
                  : "Vencido"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
