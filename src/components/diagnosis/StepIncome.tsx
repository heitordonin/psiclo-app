import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface StepIncomeProps {
  data: {
    salary: number;
    other_income: number;
  };
  onChange: (field: string, value: number) => void;
}

export function StepIncome({ data, onChange }: StepIncomeProps) {
  const total = (data.salary || 0) + (data.other_income || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Receitas Mensais</h2>
        <p className="text-muted-foreground">Informe suas fontes de receita mensal</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salário Líquido</Label>
          <CurrencyInput
            value={data.salary || 0}
            onChange={(value) => onChange("salary", value || 0)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_income">Outras Receitas (freelancer, aluguel, etc.)</Label>
          <CurrencyInput
            value={data.other_income || 0}
            onChange={(value) => onChange("other_income", value || 0)}
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <Card className="p-4 bg-primary/5">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total de Receitas:</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>
      </Card>
    </div>
  );
}
