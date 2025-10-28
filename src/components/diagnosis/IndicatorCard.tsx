import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IndicatorCardProps {
  title: string;
  value: string;
  subtitle?: string;
  status: "success" | "warning" | "danger";
  icon: React.ReactNode;
}

export function IndicatorCard({ title, value, subtitle, status, icon }: IndicatorCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm font-medium mt-1",
              status === "success" && "text-green-600",
              status === "warning" && "text-yellow-600",
              status === "danger" && "text-red-600"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          status === "success" && "bg-green-100 text-green-600",
          status === "warning" && "bg-yellow-100 text-yellow-600",
          status === "danger" && "bg-red-100 text-red-600"
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
