import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Custo = Tables<"custos">;

export function useCosts(projetoId: string) {
  return useQuery({
    queryKey: ["custos", projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custos")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projetoId,
  });
}

export function useCreateCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cost: TablesInsert<"custos">) => {
      const { data, error } = await supabase.from("custos").insert(cost).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["custos", vars.projeto_id] }),
  });
}

export function useDeleteCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from("custos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["custos", vars.projeto_id] }),
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
