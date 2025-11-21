import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/formatters";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import type { DREData } from "@/lib/report-utils";
import { Badge } from "@/components/ui/badge";

interface DREReportProps {
  dreData: DREData;
}

export function DREReport({ dreData }: DREReportProps) {
  const fixedCategories = dreData.categories.filter(cat => cat.isFixed);
  const variableCategories = dreData.categories.filter(cat => !cat.isFixed);

  const fixedPercentage = dreData.totalExpenses > 0 
    ? (dreData.fixedExpenses / dreData.totalExpenses) * 100 
    : 0;

  const variablePercentage = dreData.totalExpenses > 0 
    ? (dreData.variableExpenses / dreData.totalExpenses) * 100 
    : 0;

  const getPercentageColor = (percentage: number) => {
    if (percentage < 20) return 'text-success';
    if (percentage < 30) return 'text-warning';
    return 'text-destructive';
  };

  const CategoryItem = ({ category, isSubcategory = false }: { category: any; isSubcategory?: boolean }) => (
    <div className={`flex items-center justify-between py-2 ${isSubcategory ? 'pl-8' : ''}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {category.icon && !isSubcategory && (
          <div className="flex-shrink-0">
            <CategoryIcon 
              icon={category.icon} 
              color={category.color} 
              size={12}
            />
          </div>
        )}
        <span className={`${isSubcategory ? 'text-sm' : 'font-medium'} truncate`}>
          {category.name}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="font-semibold min-w-[7rem] text-right">
          {formatCurrency(category.total)}
        </span>
        <span className={`text-sm min-w-[3rem] text-right ${getPercentageColor(category.percentage)}`}>
          {category.percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">DRE - Demonstrativo de Resultado</h2>
          <p className="text-sm text-muted-foreground mt-1">Período: {dreData.period}</p>
        </div>

        {/* Total */}
        <div className="bg-accent/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">DESPESAS TOTAIS</h3>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(dreData.totalExpenses)}</p>
              <p className="text-sm text-muted-foreground">100%</p>
            </div>
          </div>
        </div>

        {/* Despesas Fixas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Despesas Fixas</h3>
              <Badge variant={fixedPercentage > 60 ? "destructive" : "default"}>
                {fixedPercentage.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xl font-bold">{formatCurrency(dreData.fixedExpenses)}</p>
          </div>
          
          <Progress value={fixedPercentage} className="mb-4" />

          <Accordion type="multiple" className="w-full">
            {fixedCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:no-underline">
                  <CategoryItem category={category} />
                </AccordionTrigger>
                {category.subcategories && category.subcategories.length > 0 && (
                  <AccordionContent>
                    <div className="space-y-1 border-l-2 border-border ml-2">
                      {category.subcategories.map((sub) => (
                        <CategoryItem key={sub.id} category={sub} isSubcategory />
                      ))}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Despesas Variáveis */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Despesas Variáveis</h3>
              <Badge variant="secondary">
                {variablePercentage.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xl font-bold">{formatCurrency(dreData.variableExpenses)}</p>
          </div>
          
          <Progress value={variablePercentage} className="mb-4" indicatorClassName="bg-secondary" />

          <Accordion type="multiple" className="w-full">
            {variableCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:no-underline">
                  <CategoryItem category={category} />
                </AccordionTrigger>
                {category.subcategories && category.subcategories.length > 0 && (
                  <AccordionContent>
                    <div className="space-y-1 border-l-2 border-border ml-2">
                      {category.subcategories.map((sub) => (
                        <CategoryItem key={sub.id} category={sub} isSubcategory />
                      ))}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Indicadores */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Indicadores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Proporção Fixas/Variáveis</p>
              <p className="text-xl font-bold">
                {fixedPercentage.toFixed(0)}% / {variablePercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {fixedPercentage > 60 
                  ? '⚠️ Despesas fixas acima do ideal (máx 50%)'
                  : fixedPercentage >= 40 
                  ? '✅ Proporção equilibrada'
                  : 'ℹ️ Despesas fixas baixas'
                }
              </p>
            </Card>

            {dreData.biggestCategory && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Maior Despesa</p>
                <p className="text-xl font-bold">{dreData.biggestCategory.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {formatCurrency(dreData.biggestCategory.total)} ({dreData.biggestCategory.percentage.toFixed(0)}%)
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
