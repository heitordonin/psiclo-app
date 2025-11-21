import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensesByMonth() {
  const { data, isLoading } = useQuery({
    queryKey: ['expenses-by-month'],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const now = new Date();
      const months = [];
      
      // Pegar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const startDate = startOfMonth(monthDate);
        const endDate = endOfMonth(monthDate);

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userData.user.id)
          .eq("type", "expense")
          .gte("transaction_date", format(startDate, 'yyyy-MM-dd'))
          .lte("transaction_date", format(endDate, 'yyyy-MM-dd'));

        const total = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;

        months.push({
          month: format(monthDate, 'MMM/yy', { locale: ptBR }),
          total,
          isCurrentMonth: i === 0
        });
      }

      const average = months.reduce((sum, m) => sum + m.total, 0) / months.length;
      const max = Math.max(...months.map(m => m.total));
      const min = Math.min(...months.map(m => m.total));

      return { months, average, max, min };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 w-full" />
      </Card>
    );
  }

  if (!data || data.months.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          Nenhum dado encontrado
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Comparativo Mensal</h3>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.months}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
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
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.month}</p>
                      <p className="text-sm text-primary">
                        {formatCurrency(data.total)}
                      </p>
                      {data.isCurrentMonth && (
                        <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={data.average} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="3 3"
              label={{ value: 'Média', fill: 'hsl(var(--warning))' }}
            />
            <Bar 
              dataKey="total" 
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Média</p>
          <p className="text-sm font-semibold">{formatCurrency(data.average)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Maior</p>
          <p className="text-sm font-semibold text-destructive">{formatCurrency(data.max)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Menor</p>
          <p className="text-sm font-semibold text-success">{formatCurrency(data.min)}</p>
        </div>
      </div>
    </Card>
  );
}
