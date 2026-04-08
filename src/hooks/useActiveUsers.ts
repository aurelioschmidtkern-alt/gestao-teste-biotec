import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useActiveUsers() {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, nome")
        .eq("status", "Ativo")
        .order("nome");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
