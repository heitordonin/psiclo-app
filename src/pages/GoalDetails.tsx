import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { ContributionModal } from "@/components/goals/ContributionModal";
import { ContributionItem } from "@/components/goals/ContributionItem";
import { GoalModal } from "@/components/goals/GoalModal";
import {
  useFinancialGoals,
  useGoalContributions,
  useAddContribution,
  useDeleteContribution,
  useDeleteFinancialGoal,
  useUpdateFinancialGoal,
} from "@/hooks/useGoals";

export default function GoalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goals, isLoading: goalsLoading } = useFinancialGoals();
  const { data: contributions, isLoading: contributionsLoading } = useGoalContributions(id!);
  const addContribution = useAddContribution();
  const deleteContribution = useDeleteContribution();
  const deleteGoal = useDeleteFinancialGoal();
  const updateGoal = useUpdateFinancialGoal();

  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const goal = goals?.find((g) => g.id === id);

  const handleAddContribution = (amount: number, date: string) => {
    addContribution.mutate({
      goalId: id!,
      amount,
      date,
    });
  };

  const handleDeleteContribution = (contributionId: string) => {
    deleteContribution.mutate({
      id: contributionId,
      goalId: id!,
    });
  };

  const handleDeleteGoal = () => {
    deleteGoal.mutate(id!, {
      onSuccess: () => {
        navigate("/goals");
      },
    });
  };

  const handleUpdateGoal = (data: {
    name: string;
    goal_type: string;
    target_amount: number;
    target_date?: string;
  }) => {
    updateGoal.mutate({
      id: id!,
      updates: data,
    });
  };

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
          <div className="px-4 py-6">
            <Skeleton className="h-8 w-48 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Meta não encontrada</h2>
          <Button onClick={() => navigate("/goals")}>Voltar para Metas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/goals")}
                className="hover:bg-background/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{goal.name}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-background/20"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Meta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Meta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-primary-foreground/80 capitalize">{goal.goal_type}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Progress Card */}
        <GoalProgress
          currentAmount={Number(goal.current_amount)}
          targetAmount={Number(goal.target_amount)}
          targetDate={goal.target_date || undefined}
        />

        {/* Add Contribution Button */}
        <Button
          onClick={() => setShowContributionModal(true)}
          className="w-full"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Aporte
        </Button>

        {/* Contributions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Histórico de Aportes</h2>
          {contributionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : contributions && contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.map((contribution) => (
                <ContributionItem
                  key={contribution.id}
                  contribution={contribution}
                  onDelete={() => handleDeleteContribution(contribution.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum aporte registrado ainda</p>
              <p className="text-sm mt-1">Comece adicionando seu primeiro aporte</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContributionModal
        open={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSave={handleAddContribution}
      />

      <GoalModal
        goal={goal}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateGoal}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os aportes desta meta também serão
              removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
