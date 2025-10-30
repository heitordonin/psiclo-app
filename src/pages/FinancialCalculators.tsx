import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlySavingsCalculator } from "@/components/calculators/MonthlySavingsCalculator";
import { RetirementCalculator } from "@/components/calculators/RetirementCalculator";
import { FutureValueCalculator } from "@/components/calculators/FutureValueCalculator";

export default function FinancialCalculators() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Calculadoras Financeiras</h1>
              <p className="text-sm text-muted-foreground">
                Planeje seu futuro financeiro
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="monthly-savings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="monthly-savings">Poupança Mensal</TabsTrigger>
            <TabsTrigger value="retirement">Aposentadoria</TabsTrigger>
            <TabsTrigger value="future-value">Crescimento</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly-savings">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Quanto preciso poupar por mês?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Descubra o valor mensal necessário para alcançar sua meta financeira
                </p>
              </div>
              <MonthlySavingsCalculator />
            </div>
          </TabsContent>

          <TabsContent value="retirement">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Quanto preciso acumular para me aposentar?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Calcule o valor necessário para suas retiradas mensais na aposentadoria
                </p>
              </div>
              <RetirementCalculator />
            </div>
          </TabsContent>

          <TabsContent value="future-value">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Quanto vou ter no futuro?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Projete o crescimento do seu patrimônio com aportes mensais
                </p>
              </div>
              <FutureValueCalculator />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
