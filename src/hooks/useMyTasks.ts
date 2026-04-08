import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MyTask {
  id: string;
  nome: string;
  descricao: string | null;
  status: string;
  data_inicio: string | null;
  data_fim: string | null;
  responsavel: string[] | null;
  prioridade: string | null;
  projeto_id: string;
  projeto_nome: string;
  created_at: string;
}

export function useMyTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      // Get user profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("user_id", user!.id)
        .single();

      if (!profile) return [];

      const userName = profile.nome;

      // Get tasks where user is responsible, excluding completed
      const { data, error } = await supabase
        .from("tarefas")
        .select("id, nome, descricao, status, data_inicio, data_fim, responsavel, prioridade, projeto_id, created_at, projetos(nome)")
        .eq("deleted", false)
        .neq("status", "Concluído")
        .contains("responsavel", [userName])
        .order("data_fim", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao,
        status: t.status,
        data_inicio: t.data_inicio,
        data_fim: t.data_fim,
        responsavel: t.responsavel,
        prioridade: t.prioridade,
        projeto_id: t.projeto_id,
        projeto_nome: (t.projetos as any)?.nome ?? "Sem projeto",
        created_at: t.created_at,
      })) as MyTask[];
    },
    enabled: !!user?.id,
  });
}
