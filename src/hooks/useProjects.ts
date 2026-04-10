import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { logAudit } from "@/lib/auditLog";

export type Projeto = Tables<"projetos">;

export function useProjects() {
  return useQuery({
    queryKey: ["projetos"],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("id, nome, status, responsavel, created_at, descricao")
        .eq("deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeletedProjects() {
  return useQuery({
    queryKey: ["projetos-deleted"],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("id, nome, status, responsavel, deleted_at")
        .eq("deleted", true)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: TablesInsert<"projetos">) => {
      const { data, error } = await supabase.from("projetos").insert(project).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      logAudit({
        action: "create",
        entity: "projeto",
        entity_id: data.id,
        entity_name: data.nome,
      });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"projetos"> & { id: string }) => {
      const { data, error } = await supabase.from("projetos").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      logAudit({
        action: "update",
        entity: "projeto",
        entity_id: data.id,
        entity_name: data.nome,
      });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projetos")
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      qc.invalidateQueries({ queryKey: ["projetos-deleted"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      logAudit({
        action: "delete",
        entity: "projeto",
        entity_id: id,
      });
    },
  });
}

export function useRestoreProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projetos")
        .update({ deleted: false, deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      qc.invalidateQueries({ queryKey: ["projetos-deleted"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      logAudit({
        action: "restore",
        entity: "projeto",
        entity_id: id,
      });
    },
  });
}

export function usePermanentlyDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["projetos-deleted"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      logAudit({
        action: "permanent_delete",
        entity: "projeto",
        entity_id: id,
      });
    },
  });
}
