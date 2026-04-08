import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Tarefa = Tables<"tarefas">;

async function checkAndUpdateProjectStatus(
  projetoId: string,
  oldStatus?: string,
  newStatus?: string
): Promise<boolean> {
  if (oldStatus && newStatus && oldStatus !== "Concluído" && newStatus !== "Concluído") {
    return false;
  }

  const { data: tasks } = await supabase
    .from("tarefas")
    .select("status")
    .eq("projeto_id", projetoId)
    .eq("deleted", false);

  if (!tasks || tasks.length === 0) return false;

  const allDone = tasks.every(t => t.status === "Concluído");
  const newProjectStatus = allDone ? "Concluído" : "Ativo";

  const { data: project } = await supabase
    .from("projetos")
    .select("status")
    .eq("id", projetoId)
    .single();

  if (project && project.status !== newProjectStatus) {
    await supabase.from("projetos").update({ status: newProjectStatus }).eq("id", projetoId);
    return true;
  }
  return false;
}

export function useTasks(projetoId: string) {
  return useQuery({
    queryKey: ["tarefas", projetoId],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("projeto_id", projetoId)
        .eq("deleted", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!projetoId,
  });
}

export function useDeletedTasks() {
  return useQuery({
    queryKey: ["tarefas-deleted"],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*, projetos(nome)")
        .eq("deleted", true)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
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
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
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
      qc.invalidateQueries({ queryKey: ["dashboard"] });

      if (vars.status) {
        const statusChanged = await checkAndUpdateProjectStatus(vars.projeto_id, undefined, vars.status);
        if (statusChanged) {
          qc.invalidateQueries({ queryKey: ["projetos"] });
        }
      }
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      qc.invalidateQueries({ queryKey: ["tarefas-deleted"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });

      const statusChanged = await checkAndUpdateProjectStatus(vars.projeto_id);
      if (statusChanged) {
        qc.invalidateQueries({ queryKey: ["projetos"] });
      }
    },
  });
}

export function useRestoreTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ deleted: false, deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      qc.invalidateQueries({ queryKey: ["tarefas-deleted"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });

      const statusChanged = await checkAndUpdateProjectStatus(vars.projeto_id);
      if (statusChanged) {
        qc.invalidateQueries({ queryKey: ["projetos"] });
      }
    },
  });
}

export function usePermanentlyDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projeto_id }: { id: string; projeto_id: string }) => {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tarefas-deleted"] });
      qc.invalidateQueries({ queryKey: ["tarefas", vars.projeto_id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
