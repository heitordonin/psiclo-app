import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface StepFixedExpensesProps {
  data: {
    rent: number;
    condominium: number;
    electricity: number;
    water: number;
    internet_tv: number;
    mobile_phone: number;
    health_insurance: number;
    gym: number;
    education: number;
    insurance: number;
    other_fixed_expenses: number;
  };
  onChange: (field: string, value: number) => void;
}

export function StepFixedExpenses({ data, onChange }: StepFixedExpensesProps) {
  const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

  const fields = [
    { id: "rent", label: "Aluguel" },
    { id: "condominium", label: "Condomínio" },
    { id: "electricity", label: "Energia Elétrica" },
    { id: "water", label: "Água" },
    { id: "internet_tv", label: "Internet/TV" },
    { id: "mobile_phone", label: "Celular" },
    { id: "health_insurance", label: "Plano de Saúde" },
    { id: "gym", label: "Academia" },
    { id: "education", label: "Educação" },
    { id: "insurance", label: "Seguros" },
    { id: "other_fixed_expenses", label: "Outras Despesas Fixas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Despesas Fixas Mensais</h2>
        <p className="text-muted-foreground">Informe seus gastos fixos que se repetem todo mês</p>
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

      <Card className="p-4 bg-red-50">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total de Despesas Fixas:</span>
          <span className="text-xl font-bold text-red-600">{formatCurrency(total)}</span>
        </div>
      </Card>
    </div>
  );
}
