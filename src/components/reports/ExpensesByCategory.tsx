import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import type { CategoryReport } from "@/lib/report-utils";
import { useState } from "react";

interface ExpensesByCategoryProps {
  categories: CategoryReport[];
}

interface DrillDownState {
  level: 'root' | 'category';
  currentCategory: CategoryReport | null;
  data: CategoryReport[];
}

export function ExpensesByCategory({ categories }: ExpensesByCategoryProps) {
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    level: 'root',
    currentCategory: null,
    data: categories
  });

  const handleCategoryClick = (category: CategoryReport) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setDrillDown({
        level: 'category',
        currentCategory: category,
        data: category.subcategories
      });
    }
  };

  const handleBack = () => {
    setDrillDown({
      level: 'root',
      currentCategory: null,
      data: categories
    });
  };

  const chartData = drillDown.data.map(cat => ({
    name: cat.name,
    value: cat.total,
    percentage: cat.percentage,
    color: cat.color || '#8B5CF6',
    icon: cat.icon,
    category: cat
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = chartData.map(item => item.color);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">
            {drillDown.level === 'root' ? 'Despesas por Categoria' : drillDown.currentCategory?.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {drillDown.level === 'root' 
              ? 'Clique em uma categoria para ver detalhes'
              : 'Subcategorias'
            }
          </p>
        </div>
        {drillDown.level === 'category' && (
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhuma despesa encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(data) => handleCategoryClick(data.category)}
                  className="cursor-pointer focus:outline-none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index]} 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {chartData.map((item, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(item.category)}
                className="w-full p-3 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {item.category.subcategories && item.category.subcategories.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 ml-7">
                    {item.category.subcategories.length} subcategoria{item.category.subcategories.length !== 1 ? 's' : ''}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
