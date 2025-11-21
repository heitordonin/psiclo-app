import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Info } from "lucide-react";
import type { Insight } from "@/lib/report-utils";

interface InsightsPanelProps {
  insights: Insight[];
}

const iconMap = {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target,
  Info
};

const typeConfig = {
  info: {
    variant: "secondary" as const,
    className: "border-blue-200 dark:border-blue-900"
  },
  warning: {
    variant: "outline" as const,
    className: "border-warning/50 bg-warning/5"
  },
  success: {
    variant: "outline" as const,
    className: "border-success/50 bg-success/5"
  },
  alert: {
    variant: "outline" as const,
    className: "border-destructive/50 bg-destructive/5"
  }
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insights e Alertas</h3>
        <Badge variant="secondary">{insights.length}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon as keyof typeof iconMap] || Info;
          const config = typeConfig[insight.type];

          return (
            <Card key={insight.id} className={`p-4 ${config.className}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-success/10 text-success' :
                  insight.type === 'warning' ? 'bg-warning/10 text-warning' :
                  insight.type === 'alert' ? 'bg-destructive/10 text-destructive' :
                  'bg-primary/10 text-primary'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    {insight.value && (
                      <Badge variant={config.variant} className="text-xs flex-shrink-0">
                        {insight.value}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
