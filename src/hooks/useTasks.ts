import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Tarefa = Tables<"tarefas">;

async function checkAndUpdateProjectStatus(projetoId: string) {
  const { data: tasks } = await supabase
    .from("tarefas")
    .select("status")
    .eq("projeto_id", projetoId);

  if (!tasks || tasks.length === 0) return;

  const allDone = tasks.every(t => t.status === "Concluído");
  const newStatus = allDone ? "Concluído" : "Ativo";

  const { data: project } = await supabase
    .from("projetos")
    .select("status")
    .eq("id", projetoId)
    .single();

  if (project && ((allDone && project.status !== "Concluído") || (!allDone && project.status === "Concluído"))) {
    await supabase.from("projetos").update({ status: newStatus }).eq("id", projetoId);
  }
}

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
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] }); qc.invalidateQueries({ queryKey: ["my-tasks"] }); },
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
    onSuccess: async (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      await checkAndUpdateProjectStatus(vars.projeto_id);
      qc.invalidateQueries({ queryKey: ["projetos"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      await checkAndUpdateProjectStatus(vars.projeto_id);
      qc.invalidateQueries({ queryKey: ["projetos"] });
    },
  });
}
