import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/formatters";

interface WeeklyChartProps {
  data: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  // Transformar dados para o formato do gráfico
  const chartData = data.map(day => ({
    day: format(parseISO(day.date), 'EEE', { locale: ptBR }),
    balance: day.balance,
    income: day.income,
    expenses: day.expenses,
  }));

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Últimos 7 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-medium">{data.day}</p>
                    <p className="text-success">
                      Receitas: {formatCurrency(data.income)}
                    </p>
                    <p className="text-destructive">
                      Despesas: {formatCurrency(data.expenses)}
                    </p>
                    <p className="font-semibold border-t mt-1 pt-1">
                      Saldo: {formatCurrency(data.balance)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="balance" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.balance >= 0 ? '#059669' : '#EF4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
