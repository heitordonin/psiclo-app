import { useState } from "react";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useMetrics } from "@/hooks/useMetrics";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { EmptyState } from "@/components/transactions/EmptyState";
import { TransactionSkeleton } from "@/components/transactions/TransactionSkeleton";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  budget_categories: Database["public"]["Tables"]["budget_categories"]["Row"] | null;
};

export default function Transactions() {
  const [filters, setFilters] = useState({
    period: "current_month" as const,
    type: "all" as const,
    search: "",
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    transaction?: Transaction;
  }>({
    isOpen: false,
    transaction: undefined,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    transactionId: "",
  });

  const { data: transactions, isLoading } = useTransactions(filters);
  const { data: metrics } = useMetrics("current_month");
  const deleteMutation = useDeleteTransaction();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleAddTransaction = () => {
    setModalState({ isOpen: true, transaction: undefined });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setModalState({ isOpen: true, transaction });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ isOpen: true, transactionId: id });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deleteDialog.transactionId);
    setDeleteDialog({ isOpen: false, transactionId: "" });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-primary px-4 pb-6 pt-6">
        <h1 className="text-2xl font-bold text-primary-foreground mb-2">
          Transações
        </h1>
        <p className="text-primary-foreground/80 text-sm">
          Saldo do mês:{" "}
          <span className="font-semibold">
            {metrics ? formatCurrency(metrics.balance) : "..."}
          </span>
        </p>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Conteúdo */}
      <div className="px-4 pt-4">
        {isLoading ? (
          <TransactionSkeleton />
        ) : transactions && transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteClick}
          />
        ) : (
          <EmptyState onAddTransaction={handleAddTransaction} />
        )}
      </div>

      {/* FAB Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 z-20"
        onClick={handleAddTransaction}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal de transação */}
      <TransactionModal
        open={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, transaction: undefined })}
        transaction={modalState.transaction}
      />

      {/* Dialog de confirmação de delete */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ isOpen: false, transactionId: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
