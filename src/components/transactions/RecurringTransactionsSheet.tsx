import { Repeat, Plus, AlertCircle, RefreshCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTransactions, useDeleteRecurringTransaction, useProcessRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { RecurringTransactionItem } from "./RecurringTransactionItem";
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
import { useState } from "react";

interface RecurringTransactionsSheetProps {
  open: boolean;
  onClose: () => void;
  onAddRecurring: () => void;
}

export function RecurringTransactionsSheet({ open, onClose, onAddRecurring }: RecurringTransactionsSheetProps) {
  const { data: transactions, isLoading } = useRecurringTransactions();
  const deleteMutation = useDeleteRecurringTransaction();
  const processMutation = useProcessRecurringTransactions();
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    transactionId: "",
  });

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ isOpen: true, transactionId: id });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deleteDialog.transactionId);
    setDeleteDialog({ isOpen: false, transactionId: "" });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Transações Recorrentes
            </SheetTitle>
            <SheetDescription>
              Gerencie suas transações que se repetem automaticamente
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-180px)] pb-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Transações recorrentes são geradas automaticamente todos os dias às 2h da manhã.
                Use o botão abaixo para processar manualmente a qualquer momento.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => {
                onClose();
                onAddRecurring();
              }} 
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Transação Recorrente
            </Button>

            <Button 
              onClick={() => processMutation.mutate()} 
              variant="outline"
              className="w-full"
              disabled={processMutation.isPending}
            >
              {processMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Processar Recorrências Agora
                </>
              )}
            </Button>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <RecurringTransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Repeat className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhuma transação recorrente configurada</p>
                <p className="text-xs mt-1">
                  Crie transações que se repetem automaticamente
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ isOpen: false, transactionId: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar transação recorrente?</AlertDialogTitle>
            <AlertDialogDescription>
              Novas transações não serão mais geradas automaticamente. As transações já criadas não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
