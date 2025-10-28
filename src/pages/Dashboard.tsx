import { useMetrics } from "@/hooks/useMetrics";
import { useTransactions } from "@/hooks/useTransactions";
import { BottomNav } from "@/components/BottomNav";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { TrendingUp, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics("current_month");
  const { data: recentTransactions, isLoading: txLoading } = useTransactions({ limit: 5 });

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-primary px-4 pb-8 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-primary-foreground">
          Olá! 👋
        </h1>
        <p className="text-primary-foreground/80">
          Aqui está seu resumo financeiro
        </p>
      </div>

      <div className="space-y-4 px-4 -mt-4">
        {/* Saldo do Mês */}
        <MetricCard
          title="Saldo do Mês"
          value={metrics?.balance ?? 0}
          icon={TrendingUp}
          isLoading={metricsLoading}
        />

        {/* Receitas e Despesas */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Receitas"
            value={metrics?.income ?? 0}
            icon={ArrowUpIcon}
            iconColor="text-success"
            valueColor="text-success"
            isLoading={metricsLoading}
          />
          <MetricCard
            title="Despesas"
            value={metrics?.expenses ?? 0}
            icon={ArrowDownIcon}
            iconColor="text-destructive"
            valueColor="text-destructive"
            isLoading={metricsLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4">
        <QuickActions />
      </div>

      {/* Resumo do Orçamento */}
      <div className="px-4 mt-4">
        <BudgetOverview />
      </div>

      {/* Gráfico Semanal */}
      <div className="px-4 mt-4">
        {metrics?.dailyData && <WeeklyChart data={metrics.dailyData} />}
      </div>

      {/* Transações Recentes */}
      <div className="px-4 mt-4">
        <RecentTransactions 
          transactions={recentTransactions} 
          isLoading={txLoading} 
        />
      </div>

      <BottomNav />
    </div>
  );
}
