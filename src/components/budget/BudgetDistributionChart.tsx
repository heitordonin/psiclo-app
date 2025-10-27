import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";

type Budget = Database["public"]["Tables"]["budgets"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

interface BudgetDistributionChartProps {
  budgets: Budget[];
}

export function BudgetDistributionChart({
  budgets,
}: BudgetDistributionChartProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum dado para exibir</p>
      </div>
    );
  }

  const data = budgets
    .filter((b) => b.budget_categories && b.planned_amount > 0)
    .map((b) => ({
      name: b.budget_categories!.name,
      value: b.planned_amount,
      color: b.budget_categories!.color,
    }));

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum orçamento definido</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
