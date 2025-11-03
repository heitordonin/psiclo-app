import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

interface FutureBadgeProps {
  isFuture: boolean;
}

export function FutureBadge({ isFuture }: FutureBadgeProps) {
  if (!isFuture) return null;

  return (
    <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
      <CalendarClock className="h-3 w-3" />
      <span className="text-xs">Futura</span>
    </Badge>
  );
}
