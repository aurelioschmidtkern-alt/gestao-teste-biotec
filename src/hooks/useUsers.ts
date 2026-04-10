import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/auditLog";

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  perfil: string;
  status: string;
  created_at: string;
  email: string;
}

async function invokeManageUsers(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useUsers() {
  return useQuery<UserProfile[]>({
    queryKey: ["users"],
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await invokeManageUsers("list");
      return res.users;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { email: string; password: string; nome: string; perfil: string }) => {
      return invokeManageUsers("create", params);
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      logAudit({
        action: "create",
        entity: "usuario",
        entity_id: data.user?.id ?? "",
        entity_name: vars.nome,
        metadata: { perfil: vars.perfil },
      });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { user_id: string; nome?: string; perfil?: string; status?: string; password?: string }) => {
      return invokeManageUsers("update", params);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      logAudit({
        action: "update",
        entity: "usuario",
        entity_id: vars.user_id,
        entity_name: vars.nome,
        metadata: { perfil: vars.perfil, status: vars.status },
      });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { user_id: string }) => {
      return invokeManageUsers("delete", params);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      logAudit({
        action: "delete",
        entity: "usuario",
        entity_id: vars.user_id,
      });
    },
  });
}
