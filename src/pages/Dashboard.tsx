import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from "lucide-react";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { BottomNav } from "@/components/BottomNav";

export default function Dashboard() {
  const { data: transactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, budget_categories(name, color, icon)")
        .order("transaction_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["monthly-summary"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .gte("transaction_date", startOfMonth.toISOString());

      if (error) throw error;

      const income = data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        income,
        expenses,
        balance: income - expenses,
      };
    },
  });

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-primary px-4 pb-8 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-primary-foreground">
          Olá! 👋
        </h1>
        <p className="text-primary-foreground/80">
          Aqui está seu resumo financeiro
        </p>
      </div>

      <div className="space-y-4 px-4 -mt-4">
        {/* Metric Cards */}
        <div className="grid gap-3">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo do Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary?.balance ?? 0)}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receitas
                </CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-success">
                  {formatCurrency(summary?.income ?? 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesas
                </CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {formatCurrency(summary?.expenses ?? 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions?.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma transação registrada ainda
              </p>
            )}
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: transaction.budget_categories?.color + "20",
                    }}
                  >
                    <span className="text-lg">
                      {transaction.budget_categories?.icon === "Utensils" && "🍽️"}
                      {transaction.budget_categories?.icon === "Car" && "🚗"}
                      {transaction.budget_categories?.icon === "Home" && "🏠"}
                      {transaction.budget_categories?.icon === "Heart" && "❤️"}
                      {transaction.budget_categories?.icon === "Banknote" && "💵"}
                      {!transaction.budget_categories && "💰"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-right font-semibold ${
                    transaction.type === "income"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(transaction.amount))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
