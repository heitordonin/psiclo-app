import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, type Currency } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];

interface ContributionItemProps {
  contribution: GoalContribution;
  currency: Currency;
  onDelete: () => void;
}

export function ContributionItem({ contribution, currency, onDelete }: ContributionItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div>
        <p className="font-semibold text-lg">
          {formatCurrency(Number(contribution.amount), currency)}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(contribution.contribution_date), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover aporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O valor será removido do total da meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
