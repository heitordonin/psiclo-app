import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddTransaction: () => void;
}

export function EmptyState({ onAddTransaction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Wallet className="h-24 w-24 text-muted-foreground/40 mb-6" />
      
      <h3 className="text-lg font-semibold mb-2">
        Nenhuma transação ainda
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        Comece a registrar suas receitas e despesas para ter controle total das suas finanças
      </p>
      
      <Button onClick={onAddTransaction} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        Adicionar primeira transação
      </Button>
    </div>
  );
}
