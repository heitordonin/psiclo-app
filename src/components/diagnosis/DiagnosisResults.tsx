import { HealthScore } from "./HealthScore";
import { IndicatorCard } from "./IndicatorCard";
import { DiagnosisChart } from "./DiagnosisChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiagnosisIndicators } from "@/hooks/useDiagnosis";
import { formatCurrency } from "@/lib/formatters";
import { TrendingDown, TrendingUp, DollarSign, AlertCircle, Edit } from "lucide-react";

interface DiagnosisResultsProps {
  indicators: DiagnosisIndicators;
  onEdit: () => void;
}

export function DiagnosisResults({ indicators, onEdit }: DiagnosisResultsProps) {
  const getRecommendations = () => {
    const recommendations: string[] = [];

    if (indicators.saldoMensal < 0) {
      recommendations.push("⚠️ Seu saldo mensal está negativo. Priorize reduzir despesas variáveis e revise contratos de serviços fixos.");
    }

    if (indicators.taxaEndividamento > 50) {
      recommendations.push("🚨 Sua taxa de endividamento está crítica (>50%). Considere renegociar dívidas ou buscar orientação financeira profissional.");
    } else if (indicators.taxaEndividamento > 30) {
      recommendations.push("⚠️ Sua taxa de endividamento está alta (30-50%). Evite novas dívidas e foque em pagar as existentes.");
    }

    if (indicators.comprometimentoRenda > 80) {
      recommendations.push("🚨 Mais de 80% da sua renda está comprometida. É urgente reduzir gastos não essenciais.");
    } else if (indicators.comprometimentoRenda > 60) {
      recommendations.push("⚠️ Seu comprometimento de renda está alto. Busque formas de aumentar receita ou reduzir despesas.");
    }

    if (indicators.indiceLiquidez < indicators.totalReceitas * 0.1) {
      recommendations.push("💡 Você tem pouca margem de segurança. Tente economizar pelo menos 10-20% da sua renda mensal.");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Parabéns! Suas finanças estão equilibradas. Continue mantendo esse controle.");
      recommendations.push("💡 Considere investir o saldo disponível para fazer seu dinheiro crescer.");
    }

    return recommendations;
  };

  const getSaldoStatus = (): "success" | "warning" | "danger" => {
    if (indicators.saldoMensal > indicators.totalReceitas * 0.2) return "success";
    if (indicators.saldoMensal > 0) return "warning";
    return "danger";
  };

  const getTaxaStatus = (): "success" | "warning" | "danger" => {
    if (indicators.taxaEndividamento < 30) return "success";
    if (indicators.taxaEndividamento < 50) return "warning";
    return "danger";
  };

  const getComprometimentoStatus = (): "success" | "warning" | "danger" => {
    if (indicators.comprometimentoRenda < 60) return "success";
    if (indicators.comprometimentoRenda < 80) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resultado do Diagnóstico</h2>
          <p className="text-muted-foreground">Análise completa da sua saúde financeira</p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthScore
            score={indicators.healthScore}
            status={indicators.status}
            statusText={indicators.statusText}
          />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <IndicatorCard
            title="Saldo Mensal"
            value={formatCurrency(indicators.saldoMensal)}
            subtitle={indicators.saldoMensal >= 0 ? "Positivo" : "Negativo"}
            status={getSaldoStatus()}
            icon={indicators.saldoMensal >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          />

          <IndicatorCard
            title="Taxa de Endividamento"
            value={`${indicators.taxaEndividamento.toFixed(1)}%`}
            subtitle={
              indicators.taxaEndividamento < 30
                ? "Saudável"
                : indicators.taxaEndividamento < 50
                ? "Moderado"
                : "Crítico"
            }
            status={getTaxaStatus()}
            icon={<AlertCircle className="h-6 w-6" />}
          />

          <IndicatorCard
            title="Comprometimento de Renda"
            value={`${indicators.comprometimentoRenda.toFixed(1)}%`}
            subtitle={
              indicators.comprometimentoRenda < 60
                ? "Equilibrado"
                : indicators.comprometimentoRenda < 80
                ? "Alto"
                : "Muito Alto"
            }
            status={getComprometimentoStatus()}
            icon={<DollarSign className="h-6 w-6" />}
          />

          <IndicatorCard
            title="Índice de Liquidez"
            value={formatCurrency(indicators.indiceLiquidez)}
            subtitle={indicators.indiceLiquidez > 0 ? "Disponível" : "Indisponível"}
            status={getSaldoStatus()}
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>
      </div>

      <DiagnosisChart
        data={{
          totalDespesasFixas: indicators.totalDespesasFixas,
          totalDespesasVariaveis: indicators.totalDespesasVariaveis,
          totalParcelasDividas: indicators.totalParcelasDividas,
          saldoMensal: indicators.saldoMensal,
        }}
      />

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Recomendações Personalizadas
        </h3>
        <ul className="space-y-3">
          {getRecommendations().map((recommendation, index) => (
            <li key={index} className="text-sm leading-relaxed">
              {recommendation}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
