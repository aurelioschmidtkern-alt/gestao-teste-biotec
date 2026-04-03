import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { user_id: string; nome?: string; perfil?: string; status?: string; password?: string }) => {
      return invokeManageUsers("update", params);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
