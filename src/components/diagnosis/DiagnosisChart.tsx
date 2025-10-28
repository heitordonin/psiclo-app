import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DiagnosisChartProps {
  data: {
    totalDespesasFixas: number;
    totalDespesasVariaveis: number;
    totalParcelasDividas: number;
    saldoMensal: number;
  };
}

export function DiagnosisChart({ data }: DiagnosisChartProps) {
  const chartData = [
    { name: "Despesas Fixas", value: data.totalDespesasFixas, color: "#EF4444" },
    { name: "Despesas Variáveis", value: data.totalDespesasVariaveis, color: "#F59E0B" },
    { name: "Parcelas de Dívidas", value: data.totalParcelasDividas, color: "#8B5CF6" },
    { name: "Saldo Disponível", value: Math.max(0, data.saldoMensal), color: "#10B981" },
  ].filter(item => item.value > 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Distribuição de Gastos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
