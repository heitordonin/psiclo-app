import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalModal } from "@/components/goals/GoalModal";
import { useFinancialGoals, useCreateFinancialGoal } from "@/hooks/useGoals";

export default function Goals() {
  const navigate = useNavigate();
  const { data: goals, isLoading } = useFinancialGoals();
  const createGoal = useCreateFinancialGoal();
  const [showModal, setShowModal] = useState(false);

  const handleCreateGoal = (data: {
    name: string;
    currency: string;
    target_amount: number;
    target_date?: string;
    goal_type: string;
  }) => {
    createGoal.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Metas</h1>
            <Button
              onClick={() => setShowModal(true)}
              size="sm"
              className="bg-background/20 hover:bg-background/30 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Meta
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Acompanhe suas metas de investimento
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => navigate(`/goals/${goal.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta cadastrada</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Crie sua primeira meta de investimento e comece a acompanhar seu progresso
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </div>
        )}
      </div>

      <GoalModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateGoal}
      />

      <BottomNav />
    </div>
  );
}
