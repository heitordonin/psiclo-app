import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Budget() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-primary px-4 pb-6 pt-6">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Orçamento
        </h1>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Em breve</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aqui você poderá planejar seu orçamento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
