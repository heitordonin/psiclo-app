import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/transactions/TransactionModal";

export function QuickActions() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    defaultType?: 'income' | 'expense';
  }>({ isOpen: false });

  const openModal = (type: 'income' | 'expense') => {
    setModalState({ isOpen: true, defaultType: type });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-success text-success hover:bg-success/10"
          onClick={() => openModal('income')}
        >
          <Plus className="h-4 w-4" />
          Receita
        </Button>
        <Button 
          variant="outline"
          className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => openModal('expense')}
        >
          <Minus className="h-4 w-4" />
          Despesa
        </Button>
      </div>

      <TransactionModal
        open={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        defaultType={modalState.defaultType}
      />
    </>
  );
}
