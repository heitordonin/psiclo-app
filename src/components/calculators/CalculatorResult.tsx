import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface CalculatorResultProps {
  label: string;
  value: number | null;
  isLoading?: boolean;
  color: "green" | "orange" | "purple";
}

const colorClasses = {
  green: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400",
};

export function CalculatorResult({ label, value, isLoading, color }: CalculatorResultProps) {
  return (
    <Card className={`p-6 border-2 ${colorClasses[color]} transition-all duration-300`}>
      <p className="text-sm font-medium mb-2 opacity-80">{label}</p>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <p className="text-3xl font-bold">
          {value !== null ? formatCurrency(value) : "—"}
        </p>
      )}
    </Card>
  );
}
