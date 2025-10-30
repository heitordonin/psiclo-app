import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, Tag, Activity, Calculator } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-primary px-4 pb-6 pt-6">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Perfil
        </h1>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start px-6 py-4 h-auto"
              onClick={() => navigate('/categories')}
            >
              <Tag className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Gerenciar Categorias</p>
                <p className="text-xs text-muted-foreground">
                  Crie e personalize suas categorias
                </p>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-6 py-4 h-auto border-t"
              onClick={() => navigate('/financial-diagnosis')}
            >
              <Activity className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Diagnóstico Financeiro</p>
                <p className="text-xs text-muted-foreground">
                  Analise sua saúde financeira completa
                </p>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-6 py-4 h-auto border-t"
              onClick={() => navigate('/financial-calculators')}
            >
              <Calculator className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Calculadoras Financeiras</p>
                <p className="text-xs text-muted-foreground">
                  Planeje seu futuro financeiro
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
