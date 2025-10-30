import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { CalculatorResult } from "./CalculatorResult";
import { calculatePresentValue } from "@/lib/financial-formulas";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function RetirementCalculator() {
  const [pmt, setPmt] = useState<number | undefined>(undefined);
  const [years, setYears] = useState<number | undefined>(undefined);
  const [rate, setRate] = useState<number>(0.5);
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (pmt && years && rate > 0) {
      setIsCalculating(true);
      const timeoutId = setTimeout(() => {
        const months = years * 12;
        const monthlyRate = rate / 100;
        const pv = calculatePresentValue(monthlyRate, months, pmt);
        setResult(pv);
        setIsCalculating(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setResult(null);
    }
  }, [pmt, years, rate]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="pmt">Retirada mensal desejada</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quanto você quer retirar por mês na aposentadoria</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CurrencyInput
              value={pmt}
              onChange={setPmt}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="years">Prazo de aposentadoria (anos)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Por quantos anos você planeja viver após se aposentar</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="years"
              type="number"
              value={years || ""}
              onChange={(e) => setYears(Number(e.target.value) || undefined)}
              placeholder="30"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="rate">Taxa de juros mensal (%)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Taxa de retorno esperada por mês durante a aposentadoria</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              placeholder="0.5"
              className="h-12 text-base"
            />
          </div>
        </div>
      </Card>

      <CalculatorResult
        label="Você precisa acumular:"
        value={result}
        isLoading={isCalculating}
        color="orange"
      />
    </div>
  );
}
