import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalculatorResult } from "./CalculatorResult";
import { calculateFutureValue } from "@/lib/financial-formulas";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function FutureValueCalculator() {
  const [pv, setPv] = useState<number>(0);
  const [pmt, setPmt] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState<number | undefined>(undefined);
  const [periodUnit, setPeriodUnit] = useState<"months" | "years">("years");
  const [rate, setRate] = useState<number>(0.5);
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (pmt && period && rate > 0) {
      setIsCalculating(true);
      const timeoutId = setTimeout(() => {
        const months = periodUnit === "years" ? period * 12 : period;
        const monthlyRate = rate / 100;
        const fv = calculateFutureValue(monthlyRate, months, pmt, pv);
        setResult(fv);
        setIsCalculating(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setResult(null);
    }
  }, [pv, pmt, period, periodUnit, rate]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="pv">Valor atual investido</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quanto você já tem investido hoje</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CurrencyInput
              value={pv}
              onChange={(val) => setPv(val || 0)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="pmt">Aporte mensal</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quanto você vai investir por mês</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CurrencyInput
              value={pmt}
              onChange={setPmt}
              className="h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Prazo</Label>
              <Input
                id="period"
                type="number"
                value={period || ""}
                onChange={(e) => setPeriod(Number(e.target.value) || undefined)}
                placeholder="0"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-unit">Unidade</Label>
              <Select value={periodUnit} onValueChange={(v) => setPeriodUnit(v as "months" | "years")}>
                <SelectTrigger id="period-unit" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Meses</SelectItem>
                  <SelectItem value="years">Anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="rate">Taxa de juros mensal (%)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Taxa de retorno esperada por mês</p>
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
        label="Você terá no futuro:"
        value={result}
        isLoading={isCalculating}
        color="purple"
      />
    </div>
  );
}
