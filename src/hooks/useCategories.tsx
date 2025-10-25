import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["budget_categories"]["Row"];

export function useCategories(type?: "income" | "expense" | "all") {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      let query = supabase
        .from("budget_categories")
        .select("*")
        .order("name");

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
