import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as Icons from "lucide-react";

const AVAILABLE_ICONS = [
  'Wallet', 'ShoppingCart', 'Home', 'Car', 'Plane',
  'Coffee', 'Pizza', 'Heart', 'Book', 'Gamepad2',
  'Music', 'Camera', 'Gift', 'Phone', 'Monitor',
  'Briefcase', 'GraduationCap', 'Dumbbell', 'Pill', 'Baby',
  'Utensils', 'ShoppingBag', 'Shirt', 'Scissors', 'DollarSign',
  'TrendingUp', 'Banknote', 'CreditCard', 'Landmark', 'PiggyBank'
] as const;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Ícone</Label>
      
      {/* Preview grande do ícone selecionado */}
      <div className="flex items-center justify-center p-6 border rounded-lg bg-muted/50">
        {(() => {
          const Icon = (Icons as any)[value] || Icons.Wallet;
          return <Icon className="h-12 w-12 text-primary" />;
        })()}
      </div>
      
      {/* Grid de ícones */}
      <div className="grid grid-cols-6 gap-2">
        {AVAILABLE_ICONS.map((iconName) => {
          const Icon = (Icons as any)[iconName];
          return (
            <Button
              key={iconName}
              type="button"
              variant={value === iconName ? "default" : "outline"}
              size="icon"
              className="h-12 w-12"
              onClick={() => onChange(iconName)}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
