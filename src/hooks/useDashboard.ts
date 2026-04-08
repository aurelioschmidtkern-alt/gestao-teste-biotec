import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { getTaskUrgency } from "@/lib/taskUrgency";
import type { Tables } from "@/integrations/supabase/types";

export type DashboardData = {
  projects: Tables<"projetos">[];
  tasks: Tables<"tarefas">[];
  costs: Tables<"custos">[];
  metrics: {
    activeProjects: number;
    tasksInProgress: number;
    tasksCompleted: number;
    tasksOverdue: number;
    totalCosts: number;
  };
  tasksByStatus: { name: string; value: number; fill: string }[];
  tasksByDeadline: { name: string; value: number; fill: string }[];
  costsByCategory: { name: string; value: number }[];
  criticalTasks: (Tables<"tarefas"> & { projectName: string })[];
};

export function useDashboard(projectId?: string | null) {
  const { profile } = useProfile();

  return useQuery({
    queryKey: ["dashboard", profile?.nome, profile?.perfil, projectId],
    queryFn: async () => {
      const canViewAll = profile?.perfil === "Administrador" || profile?.perfil === "Coordenador";
      const userName = profile?.nome || "";

      // Build queries with server-side filters
      let projectsQuery = supabase.from("projetos").select("id, nome, status, responsavel").eq("deleted", false);
      let tasksQuery = supabase.from("tarefas").select("id, nome, status, data_fim, responsavel, projeto_id, prioridade").eq("deleted", false);
      let costsQuery = supabase.from("custos").select("categoria, valor, projeto_id");

      if (projectId) {
        projectsQuery = projectsQuery.eq("id", projectId);
        tasksQuery = tasksQuery.eq("projeto_id", projectId);
        costsQuery = costsQuery.eq("projeto_id", projectId);
      } else if (!canViewAll && userName) {
        projectsQuery = projectsQuery.eq("responsavel", userName);
      }

      const [projectsRes, tasksRes, costsRes] = await Promise.all([
        projectsQuery,
        tasksQuery,
        costsQuery,
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (costsRes.error) throw costsRes.error;

      let projects = projectsRes.data;
      let tasks = tasksRes.data;
      let costs = costsRes.data;

      // For non-privileged users without projectId, filter tasks by user's projects + assigned
      if (!projectId && !canViewAll && userName) {
        const projectIds = new Set(projects.map(p => p.id));
        tasks = tasks.filter(t =>
          projectIds.has(t.projeto_id) || (t.responsavel && t.responsavel.includes(userName))
        );
        costs = costs.filter(c => projectIds.has(c.projeto_id));
      }

      // Single-pass metrics calculation
      let activeProjects = 0;
      for (const p of projects) {
        if (p.status === "Ativo") activeProjects++;
      }

      let aFazer = 0, emAndamento = 0, concluido = 0;
      let onTime = 0, attention = 0, overdue = 0, tasksOverdue = 0;
      const projectMap = new Map(projects.map(p => [p.id, p.nome]));
      const criticalCandidates: (typeof tasks[number] & { projectName: string })[] = [];

      for (const t of tasks) {
        if (t.status === "Concluído") { concluido++; continue; }
        if (t.status === "A Fazer") aFazer++;
        else if (t.status === "Em Andamento") emAndamento++;

        const u = getTaskUrgency(t.data_fim, t.status);
        if (u.label?.startsWith("Atrasada")) { overdue++; tasksOverdue++; }
        else if (!u.label || u.label === "Prazo ok") onTime++;
        else attention++;

        if (u.label?.startsWith("Atrasada") || u.label === "Vence hoje" || u.label === "Vence amanhã") {
          criticalCandidates.push({ ...t, projectName: projectMap.get(t.projeto_id) || "" });
        }
      }

      const totalCosts = costs.reduce((sum, c) => sum + Number(c.valor), 0);

      const tasksByStatus = [
        { name: "A Fazer", value: aFazer, fill: "hsl(220, 14%, 60%)" },
        { name: "Em Andamento", value: emAndamento, fill: "hsl(217, 91%, 60%)" },
        { name: "Concluído", value: concluido, fill: "hsl(142, 71%, 45%)" },
      ];

      const tasksByDeadline = [
        { name: "No prazo", value: onTime, fill: "hsl(142, 71%, 45%)" },
        { name: "Atenção", value: attention, fill: "hsl(38, 92%, 50%)" },
        { name: "Atrasadas", value: overdue, fill: "hsl(0, 84%, 60%)" },
      ];

      const costMap = new Map<string, number>();
      for (const c of costs) {
        costMap.set(c.categoria, (costMap.get(c.categoria) || 0) + Number(c.valor));
      }
      const costsByCategory = Array.from(costMap.entries()).map(([name, value]) => ({ name, value }));

      const criticalTasks = criticalCandidates
        .sort((a, b) => {
          if (!a.data_fim) return 1;
          if (!b.data_fim) return -1;
          return new Date(a.data_fim).getTime() - new Date(b.data_fim).getTime();
        })
        .slice(0, 10);

      return {
        projects,
        tasks,
        costs,
        metrics: { activeProjects, tasksInProgress: emAndamento, tasksCompleted: concluido, tasksOverdue, totalCosts },
        tasksByStatus,
        tasksByDeadline,
        costsByCategory,
        criticalTasks,
      } as DashboardData;
    },
    enabled: !!profile,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
