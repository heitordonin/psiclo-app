import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiagnosisForm } from "@/components/diagnosis/DiagnosisForm";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { useDiagnosis, type FinancialDiagnosis } from "@/hooks/useDiagnosis";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function FinancialDiagnosis() {
  const navigate = useNavigate();
  const { diagnosis, isLoading, createMutation, updateMutation, calculateIndicators } = useDiagnosis();
  const [showResults, setShowResults] = useState(!!diagnosis);

  const handleSubmit = (data: FinancialDiagnosis) => {
    if (diagnosis?.id) {
      updateMutation.mutate(
        { id: diagnosis.id, data },
        {
          onSuccess: () => {
            setShowResults(true);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setShowResults(true);
        },
      });
    }
  };

  const handleEdit = () => {
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Diagnóstico Financeiro</h1>
            <p className="text-muted-foreground">Análise completa da sua saúde financeira</p>
          </div>
        </div>

        <Card className="p-6">
          {!showResults ? (
            <DiagnosisForm initialData={diagnosis || undefined} onSubmit={handleSubmit} />
          ) : diagnosis ? (
            <DiagnosisResults
              indicators={calculateIndicators(diagnosis)}
              onEdit={handleEdit}
            />
          ) : null}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
