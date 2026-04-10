import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { logAudit } from "@/lib/auditLog";

export function useProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return { profile, isLoading };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();

  return useMutation({
    mutationFn: async (data: { nome?: string; foto_url?: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      logAudit({
        action: "update",
        entity: "usuario",
        entity_id: profile?.id ?? "",
        entity_name: vars.nome ?? profile?.nome,
        profileId: profile?.id,
        description: "Perfil próprio atualizado",
      });
    },
  });
}
