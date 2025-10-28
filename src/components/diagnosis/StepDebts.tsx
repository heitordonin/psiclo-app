import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface StepDebtsProps {
  data: {
    credit_card_balance: number;
    credit_card_payment: number;
    personal_loan_balance: number;
    personal_loan_payment: number;
    vehicle_financing_balance: number;
    vehicle_financing_payment: number;
    home_financing_balance: number;
    home_financing_payment: number;
    overdraft_balance: number;
    overdraft_payment: number;
    other_debts_balance: number;
    other_debts_payment: number;
  };
  onChange: (field: string, value: number) => void;
}

export function StepDebts({ data, onChange }: StepDebtsProps) {
  const totalBalance = 
    (data.credit_card_balance || 0) +
    (data.personal_loan_balance || 0) +
    (data.vehicle_financing_balance || 0) +
    (data.home_financing_balance || 0) +
    (data.overdraft_balance || 0) +
    (data.other_debts_balance || 0);

  const totalPayment = 
    (data.credit_card_payment || 0) +
    (data.personal_loan_payment || 0) +
    (data.vehicle_financing_payment || 0) +
    (data.home_financing_payment || 0) +
    (data.overdraft_payment || 0) +
    (data.other_debts_payment || 0);

  const debts = [
    { 
      id: "credit_card", 
      label: "Cartão de Crédito",
      balanceField: "credit_card_balance",
      paymentField: "credit_card_payment"
    },
    { 
      id: "personal_loan", 
      label: "Empréstimo Pessoal",
      balanceField: "personal_loan_balance",
      paymentField: "personal_loan_payment"
    },
    { 
      id: "vehicle_financing", 
      label: "Financiamento de Veículo",
      balanceField: "vehicle_financing_balance",
      paymentField: "vehicle_financing_payment"
    },
    { 
      id: "home_financing", 
      label: "Financiamento Imobiliário",
      balanceField: "home_financing_balance",
      paymentField: "home_financing_payment"
    },
    { 
      id: "overdraft", 
      label: "Cheque Especial",
      balanceField: "overdraft_balance",
      paymentField: "overdraft_payment"
    },
    { 
      id: "other_debts", 
      label: "Outras Dívidas",
      balanceField: "other_debts_balance",
      paymentField: "other_debts_payment"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Endividamento Atual</h2>
        <p className="text-muted-foreground">Informe suas dívidas atuais e parcelas mensais</p>
      </div>

      <div className="space-y-6">
        {debts.map((debt) => (
          <Card key={debt.id} className="p-4">
            <h3 className="font-semibold mb-4">{debt.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={debt.balanceField}>Saldo Devedor</Label>
                <CurrencyInput
                  value={data[debt.balanceField as keyof typeof data] || 0}
                  onChange={(value) => onChange(debt.balanceField, value || 0)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={debt.paymentField}>Parcela Mensal</Label>
                <CurrencyInput
                  value={data[debt.paymentField as keyof typeof data] || 0}
                  onChange={(value) => onChange(debt.paymentField, value || 0)}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-purple-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Saldo Devedor:</span>
            <span className="text-xl font-bold text-purple-600">{formatCurrency(totalBalance)}</span>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Parcelas Mensais:</span>
            <span className="text-xl font-bold text-purple-600">{formatCurrency(totalPayment)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
