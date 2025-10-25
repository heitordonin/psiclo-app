import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();

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
            <Button
              onClick={signOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
