import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Tarefa = Tables<"tarefas">;

export function useTasks(projetoId: string) {
  return useQuery({
    queryKey: ["tarefas", projetoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!projetoId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: TablesInsert<"tarefas">) => {
      const { data, error } = await supabase.from("tarefas").insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id, ...updates }: TablesUpdate<"tarefas"> & { id: string; projeto_id: string }) => {
      const { data, error } = await supabase.from("tarefas").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] }),
  });
}
