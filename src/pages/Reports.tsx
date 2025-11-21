import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PeriodSelector } from "@/components/reports/PeriodSelector";
import { MetricsSummary } from "@/components/reports/MetricsSummary";
import { ExpensesByCategory } from "@/components/reports/ExpensesByCategory";
import { TopCategories } from "@/components/reports/TopCategories";
import { DREReport } from "@/components/reports/DREReport";
import { ExpensesTimeline } from "@/components/reports/ExpensesTimeline";
import { ExpensesByMonth } from "@/components/reports/ExpensesByMonth";
import { InsightsPanel } from "@/components/reports/InsightsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenseReports, type ReportFilters } from "@/hooks/useReports";
import { BarChart3 } from "lucide-react";

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'this-month',
    startDate: '',
    endDate: ''
  });

  const { data, isLoading } = useExpenseReports(filters);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Relatórios</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Análise detalhada das suas despesas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 border-b bg-card">
        <PeriodSelector value={filters} onChange={setFilters} />
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        ) : data ? (
          <>
            {/* Insights */}
            {data.insights.length > 0 && (
              <InsightsPanel insights={data.insights} />
            )}

            {/* Métricas Resumo */}
            <MetricsSummary 
              dreData={data.dreData} 
              previousDreData={data.previousDreData}
            />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="dre">DRE</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <TopCategories categories={data.categoryReports} />
                <ExpensesByCategory categories={data.categoryReports} />
              </TabsContent>

              <TabsContent value="dre" className="mt-6">
                <DREReport dreData={data.dreData} />
              </TabsContent>

              <TabsContent value="charts" className="space-y-6 mt-6">
                <ExpensesTimeline filters={filters} />
                <ExpensesByMonth />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
