import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { hex: '#059669', name: 'Verde' },
  { hex: '#10B981', name: 'Verde claro' },
  { hex: '#F59E0B', name: 'Laranja' },
  { hex: '#EF4444', name: 'Vermelho' },
  { hex: '#8B5CF6', name: 'Roxo' },
  { hex: '#EC4899', name: 'Rosa' },
  { hex: '#3B82F6', name: 'Azul' },
  { hex: '#06B6D4', name: 'Ciano' },
  { hex: '#84CC16', name: 'Lima' },
  { hex: '#F97316', name: 'Laranja escuro' },
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Cor</Label>
      
      {/* Preview da cor selecionada */}
      <div className="flex items-center gap-3 p-3 border rounded-lg">
        <div
          className="h-10 w-10 rounded-full border-2 border-background shadow-md"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-medium">
            {PRESET_COLORS.find(c => c.hex === value)?.name || 'Personalizada'}
          </p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      
      {/* Grid de cores */}
      <div className="grid grid-cols-5 gap-3">
        {PRESET_COLORS.map(({ hex, name }) => (
          <button
            key={hex}
            type="button"
            className={cn(
              "h-12 w-full rounded-lg border-4 transition-all",
              value === hex 
                ? "border-foreground scale-110" 
                : "border-transparent hover:border-muted-foreground/30"
            )}
            style={{ backgroundColor: hex }}
            onClick={() => onChange(hex)}
            title={name}
          />
        ))}
      </div>
    </div>
  );
}
