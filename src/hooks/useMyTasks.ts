import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export interface MyTask {
  id: string;
  nome: string;
  descricao: string | null;
  status: string;
  data_fim: string | null;
  responsavel: string[] | null;
  prioridade: string | null;
  projeto_id: string;
  projeto_nome: string;
}

export function useMyTasks() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const userName = profile?.nome;

  return useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("id, nome, descricao, status, data_fim, responsavel, prioridade, projeto_id, projetos(nome)")
        .eq("deleted", false)
        .neq("status", "Concluído")
        .contains("responsavel", [userName!])
        .order("data_fim", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao,
        status: t.status,
        data_fim: t.data_fim,
        responsavel: t.responsavel,
        prioridade: t.prioridade,
        projeto_id: t.projeto_id,
        projeto_nome: (t.projetos as any)?.nome ?? "Sem projeto",
      })) as MyTask[];
    },
    enabled: !!user?.id && !!userName,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
