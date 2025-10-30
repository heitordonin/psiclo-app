import { useState } from "react";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCategoryName } from "@/hooks/useCategories";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

interface CategoryPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onChange: (id: string) => void;
  categories: Category[];
  allCategories: Category[];
  title?: string;
}

export function CategoryPickerSheet({
  open,
  onOpenChange,
  value,
  onChange,
  categories,
  allCategories,
  title = "Selecionar categoria",
}: CategoryPickerSheetProps) {
  const [search, setSearch] = useState("");

  // Filtrar categorias por busca
  const filteredCategories = categories.filter((cat) => {
    const displayName = formatCategoryName(cat, allCategories);
    return (
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      displayName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b bg-card">
          <SheetTitle>{title}</SheetTitle>
          <Input
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 text-base"
            autoComplete="off"
          />
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto px-4 py-2"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
          role="listbox"
        >
          {filteredCategories.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Nenhuma categoria encontrada
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {filteredCategories.map((category) => {
                const isSelected = value === category.id;
                const IconComponent = category.icon
                  ? (LucideIcons[category.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
                  : LucideIcons.DollarSign;
                const displayName = formatCategoryName(category, allCategories);
                const isChild = !!category.parent_id;

                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto py-3 px-3",
                      isChild && "ml-4",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => handleSelect(category.id)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {IconComponent && (
                        <IconComponent
                          className="h-5 w-5 shrink-0"
                          style={{ color: category.color || "#059669" }}
                        />
                      )}
                      <span className={cn("text-left truncate", isChild && "text-sm")}>
                        {displayName}
                      </span>
                    </div>
                    {isSelected && <Check className="h-5 w-5 shrink-0 ml-2" />}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
