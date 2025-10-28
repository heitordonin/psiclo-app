import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepIncome } from "./StepIncome";
import { StepFixedExpenses } from "./StepFixedExpenses";
import { StepVariableExpenses } from "./StepVariableExpenses";
import { StepDebts } from "./StepDebts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FinancialDiagnosis } from "@/hooks/useDiagnosis";

interface DiagnosisFormProps {
  initialData?: FinancialDiagnosis;
  onSubmit: (data: FinancialDiagnosis) => void;
}

export function DiagnosisForm({ initialData, onSubmit }: DiagnosisFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FinancialDiagnosis>(
    initialData || {
      salary: 0,
      other_income: 0,
      rent: 0,
      condominium: 0,
      electricity: 0,
      water: 0,
      internet_tv: 0,
      mobile_phone: 0,
      health_insurance: 0,
      gym: 0,
      education: 0,
      insurance: 0,
      other_fixed_expenses: 0,
      leisure: 0,
      personal_shopping: 0,
      delivery: 0,
      subscriptions: 0,
      gifts: 0,
      personal_care: 0,
      travel: 0,
      transportation: 0,
      groceries: 0,
      pharmacy: 0,
      other_variable_expenses: 0,
      credit_card_balance: 0,
      credit_card_payment: 0,
      personal_loan_balance: 0,
      personal_loan_payment: 0,
      vehicle_financing_balance: 0,
      vehicle_financing_payment: 0,
      home_financing_balance: 0,
      home_financing_payment: 0,
      overdraft_balance: 0,
      overdraft_payment: 0,
      other_debts_balance: 0,
      other_debts_payment: 0,
    }
  );

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return (formData.salary || 0) + (formData.other_income || 0) > 0;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Etapa {currentStep} de {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <StepIncome
            data={{
              salary: formData.salary,
              other_income: formData.other_income,
            }}
            onChange={handleChange}
          />
        )}

        {currentStep === 2 && (
          <StepFixedExpenses
            data={{
              rent: formData.rent,
              condominium: formData.condominium,
              electricity: formData.electricity,
              water: formData.water,
              internet_tv: formData.internet_tv,
              mobile_phone: formData.mobile_phone,
              health_insurance: formData.health_insurance,
              gym: formData.gym,
              education: formData.education,
              insurance: formData.insurance,
              other_fixed_expenses: formData.other_fixed_expenses,
            }}
            onChange={handleChange}
          />
        )}

        {currentStep === 3 && (
          <StepVariableExpenses
            data={{
              leisure: formData.leisure,
              personal_shopping: formData.personal_shopping,
              delivery: formData.delivery,
              subscriptions: formData.subscriptions,
              gifts: formData.gifts,
              personal_care: formData.personal_care,
              travel: formData.travel,
              transportation: formData.transportation,
              groceries: formData.groceries,
              pharmacy: formData.pharmacy,
              other_variable_expenses: formData.other_variable_expenses,
            }}
            onChange={handleChange}
          />
        )}

        {currentStep === 4 && (
          <StepDebts
            data={{
              credit_card_balance: formData.credit_card_balance,
              credit_card_payment: formData.credit_card_payment,
              personal_loan_balance: formData.personal_loan_balance,
              personal_loan_payment: formData.personal_loan_payment,
              vehicle_financing_balance: formData.vehicle_financing_balance,
              vehicle_financing_payment: formData.vehicle_financing_payment,
              home_financing_balance: formData.home_financing_balance,
              home_financing_payment: formData.home_financing_payment,
              overdraft_balance: formData.overdraft_balance,
              overdraft_payment: formData.overdraft_payment,
              other_debts_balance: formData.other_debts_balance,
              other_debts_payment: formData.other_debts_payment,
            }}
            onChange={handleChange}
          />
        )}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === totalSteps ? "Salvar e Ver Resultados" : "Próximo"}
          {currentStep < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
