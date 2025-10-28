import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HealthScoreProps {
  score: number;
  status: "success" | "warning" | "danger";
  statusText: string;
}

export function HealthScore({ score, status, statusText }: HealthScoreProps) {
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4">Saúde Financeira</h3>
        
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-all duration-1000 ease-out",
                status === "success" && "text-green-600",
                status === "warning" && "text-yellow-600",
                status === "danger" && "text-red-600"
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{Math.round(score)}</span>
            <span className="text-sm text-muted-foreground">de 100</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-3 h-3 rounded-full",
              status === "success" && "bg-green-600",
              status === "warning" && "bg-yellow-600",
              status === "danger" && "bg-red-600"
            )} />
            <span className="text-lg font-semibold">{statusText}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {status === "success" && "Suas finanças estão equilibradas"}
            {status === "warning" && "Atenção: ajustes necessários"}
            {status === "danger" && "Situação crítica: ação urgente"}
          </p>
        </div>
      </div>
    </Card>
  );
}
