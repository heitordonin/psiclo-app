import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { TrendingDown, TrendingUp, DollarSign, Target } from "lucide-react";
import type { DREData } from "@/lib/report-utils";

interface MetricsSummaryProps {
  dreData: DREData;
  previousDreData?: DREData;
}

export function MetricsSummary({ dreData, previousDreData }: MetricsSummaryProps) {
  const variation = previousDreData
    ? ((dreData.totalExpenses - previousDreData.totalExpenses) / previousDreData.totalExpenses) * 100
    : 0;

  const fixedPercentage = dreData.totalExpenses > 0
    ? (dreData.fixedExpenses / dreData.totalExpenses) * 100
    : 0;

  const variablePercentage = dreData.totalExpenses > 0
    ? (dreData.variableExpenses / dreData.totalExpenses) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(dreData.totalExpenses)}
            </p>
            {previousDreData && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${variation >= 0 ? 'text-destructive' : 'text-success'}`}>
                {variation >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(variation).toFixed(1)}% vs período anterior</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-destructive/10">
            <DollarSign className="h-6 w-6 text-destructive" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Despesas Fixas</p>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(dreData.fixedExpenses)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {fixedPercentage.toFixed(0)}% do total
            </p>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Despesas Variáveis</p>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(dreData.variableExpenses)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {variablePercentage.toFixed(0)}% do total
            </p>
          </div>
          <div className="p-3 rounded-full bg-accent/10">
            <TrendingUp className="h-6 w-6 text-accent-foreground" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Maior Categoria</p>
            <p className="text-xl font-bold mt-2">
              {dreData.biggestCategory?.name || '—'}
            </p>
            {dreData.biggestCategory && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(dreData.biggestCategory.total)} ({dreData.biggestCategory.percentage.toFixed(0)}%)
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
