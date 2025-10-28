import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";

type FinancialGoal = Database["public"]["Tables"]["financial_goals"]["Row"];

interface GoalCardProps {
  goal: FinancialGoal;
  onClick: () => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const progress = goal.target_amount > 0 
    ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
    : 0;

  const getProgressColor = () => {
    if (progress >= 100) return "bg-success";
    if (progress >= 80) return "bg-warning";
    return "bg-primary";
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{goal.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{goal.goal_type}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-sm">
          <span className="font-medium">{formatCurrency(Number(goal.current_amount))}</span>
          <span className="text-muted-foreground text-xs">
            de {formatCurrency(Number(goal.target_amount))}
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />
        
        <div className="text-xs text-muted-foreground text-right">
          {progress.toFixed(0)}% alcançado
        </div>
      </div>
    </Card>
  );
}
