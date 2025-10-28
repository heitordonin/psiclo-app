import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface StepVariableExpensesProps {
  data: {
    leisure: number;
    personal_shopping: number;
    delivery: number;
    subscriptions: number;
    gifts: number;
    personal_care: number;
    travel: number;
    transportation: number;
    groceries: number;
    pharmacy: number;
    other_variable_expenses: number;
  };
  onChange: (field: string, value: number) => void;
}

export function StepVariableExpenses({ data, onChange }: StepVariableExpensesProps) {
  const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

  const fields = [
    { id: "groceries", label: "Mercado" },
    { id: "transportation", label: "Transporte" },
    { id: "leisure", label: "Lazer" },
    { id: "delivery", label: "Delivery/iFood" },
    { id: "personal_shopping", label: "Compras Pessoais" },
    { id: "subscriptions", label: "Assinaturas (Netflix, Spotify, etc.)" },
    { id: "personal_care", label: "Cuidados Pessoais" },
    { id: "pharmacy", label: "Farmácia" },
    { id: "gifts", label: "Presentes" },
    { id: "travel", label: "Viagens" },
    { id: "other_variable_expenses", label: "Outras Despesas Variáveis" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Despesas Variáveis Mensais</h2>
        <p className="text-muted-foreground">Informe seus gastos que variam de mês para mês</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <CurrencyInput
              value={data[field.id as keyof typeof data] || 0}
              onChange={(value) => onChange(field.id, value || 0)}
              placeholder="R$ 0,00"
            />
          </div>
        ))}
      </div>

      <Card className="p-4 bg-orange-50">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total de Despesas Variáveis:</span>
          <span className="text-xl font-bold text-orange-600">{formatCurrency(total)}</span>
        </div>
      </Card>
    </div>
  );
}
