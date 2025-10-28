import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateCategory } from "@/hooks/useCategories";
import { categorySchema } from "@/lib/validations/transaction";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
}
interface ParsedRow {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  parent_name: string | null;
  valid: boolean;
  error?: string;
}
const EXAMPLE_TEMPLATE = `Nome	Tipo	Subcategoria de
Alimentação	expense	
Restaurante	expense	Alimentação
iFood	expense	Alimentação
Transporte	expense	
Uber	expense	Transporte
Salário	income	`;
export function BulkImportModal({
  open,
  onClose
}: BulkImportModalProps) {
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const {
    toast
  } = useToast();
  const createMutation = useCreateCategory();
  const queryClient = useQueryClient();
  const parseImportData = (text: string): ParsedRow[] => {
    if (!text.trim()) return [];
    const separator = text.includes("\t") ? "\t" : ";";
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast({
        title: "Erro no formato",
        description: "É necessário pelo menos uma linha de cabeçalho e uma linha de dados",
        variant: "destructive"
      });
      return [];
    }
    const dataLines = lines.slice(1).filter(line => line.trim());
    return dataLines.map((line, index) => {
      const values = line.split(separator).map(v => v.trim());
      const row = {
        name: values[0] || "",
        type: (values[1]?.toLowerCase() === "income" ? "income" : "expense") as "income" | "expense",
        icon: "DollarSign",
        color: "#059669",
        parent_name: values[2] || null,
        valid: false,
        error: undefined as string | undefined
      };

      // Validação básica
      if (!row.name) {
        row.error = "Nome é obrigatório";
        return row;
      }
      if (row.name.length > 30) {
        row.error = "Nome deve ter no máximo 30 caracteres";
        return row;
      }

      // Validar com Zod
      try {
        categorySchema.parse({
          name: row.name,
          type: row.type,
          icon: row.icon,
          color: row.color,
          parent_id: null
        });
        row.valid = true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          row.error = error.errors[0]?.message || "Erro de validação";
        }
      }
      return row;
    });
  };
  const handleValidate = () => {
    const parsed = parseImportData(inputText);
    setParsedData(parsed);
    setShowPreview(true);
  };
  const handleImport = async () => {
    const validRows = parsedData.filter(r => r.valid);
    if (validRows.length === 0) {
      toast({
        title: "Nenhuma categoria válida",
        description: "Corrija os erros antes de importar",
        variant: "destructive"
      });
      return;
    }
    setIsImporting(true);
    try {
      // Fase 1: Importar categorias mãe (sem parent_name)
      const parents = validRows.filter(r => !r.parent_name);
      for (const row of parents) {
        await createMutation.mutateAsync({
          name: row.name,
          type: row.type,
          icon: row.icon,
          color: row.color,
          parent_id: null
        });
      }

      // Fase 2: Buscar IDs das categorias mãe recém-criadas
      const {
        data: userData
      } = await supabase.auth.getUser();
      const {
        data: allCategories
      } = await supabase.from("budget_categories").select("id, name").eq("user_id", userData.user?.id);

      // Fase 3: Importar subcategorias com parent_id correto
      const children = validRows.filter(r => r.parent_name);
      for (const row of children) {
        const parent = allCategories?.find(c => c.name.toLowerCase() === row.parent_name?.toLowerCase());
        if (!parent) {
          console.warn(`Categoria pai "${row.parent_name}" não encontrada para "${row.name}"`);
          continue;
        }
        await createMutation.mutateAsync({
          name: row.name,
          type: row.type,
          icon: row.icon,
          color: row.color,
          parent_id: parent.id
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["categories"]
      });
      toast({
        title: "Importação concluída!",
        description: `${validRows.length} categoria(s) importada(s) com sucesso`
      });
      onClose();
      setInputText("");
      setParsedData([]);
      setShowPreview(false);
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar categorias",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };
  const handleCopyExample = () => {
    navigator.clipboard.writeText(EXAMPLE_TEMPLATE);
    toast({
      title: "Exemplo copiado!",
      description: "Cole em uma planilha para editar"
    });
  };
  const validCount = parsedData.filter(r => r.valid).length;
  return <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Importar Categorias em Lote</SheetTitle>
          <SheetDescription>
            Cole dados de uma tabela (Excel, Google Sheets) para importar múltiplas categorias
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          

          <div className="space-y-2">
            <label className="text-sm font-medium">Cole os dados aqui:</label>
            <Textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder={EXAMPLE_TEMPLATE} className="min-h-[200px] font-mono text-xs" disabled={isImporting} />
          </div>

          <Button onClick={handleValidate} disabled={!inputText.trim() || isImporting} className="w-full" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Validar Dados
          </Button>

          {showPreview && parsedData.length > 0 && <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Preview</h3>
                <Badge variant={validCount === parsedData.length ? "default" : "secondary"}>
                  {validCount} de {parsedData.length} válidas
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium">Status</th>
                        <th className="text-left p-2 font-medium">Nome</th>
                        <th className="text-left p-2 font-medium">Tipo</th>
                        <th className="text-left p-2 font-medium">Pai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => <tr key={index} className="border-t">
                          <td className="p-2">
                            {row.valid ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                          </td>
                          <td className="p-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{row.name}</span>
                              {row.error && <span className="text-destructive text-[10px]">{row.error}</span>}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant={row.type === "income" ? "default" : "secondary"}>
                              {row.type === "income" ? "Receita" : "Despesa"}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {row.parent_name || "-"}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>}
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!showPreview || validCount === 0 || isImporting}>
            {isImporting ? "Importando..." : `Importar ${validCount} categoria(s)`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>;
}