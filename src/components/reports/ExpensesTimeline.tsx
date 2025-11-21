import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useExpensesTimeline } from "@/hooks/useReports";
import type { ReportFilters } from "@/components/reports/PeriodSelector";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpensesTimelineProps {
  filters: ReportFilters;
}

export function ExpensesTimeline({ filters }: ExpensesTimelineProps) {
  const { data: timelineData, isLoading } = useExpensesTimeline(filters);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 w-full" />
      </Card>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          Nenhum dado encontrado para o período selecionado
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Evolução das Despesas</h3>
        <p className="text-sm text-muted-foreground">Tendência ao longo do período</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="label" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').split(',')[0]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{payload[0].payload.label}</p>
                      <p className="text-sm text-primary">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
