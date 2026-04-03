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

export function useDashboard() {
  const { profile } = useProfile();

  return useQuery({
    queryKey: ["dashboard", profile?.nome, profile?.perfil],
    queryFn: async () => {
      const [projectsRes, tasksRes, costsRes] = await Promise.all([
        supabase.from("projetos").select("*").order("created_at", { ascending: false }),
        supabase.from("tarefas").select("*").order("created_at", { ascending: true }),
        supabase.from("custos").select("*"),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (costsRes.error) throw costsRes.error;

      let projects = projectsRes.data;
      let tasks = tasksRes.data;
      let costs = costsRes.data;

      const isAdmin = profile?.perfil === "Administrador";
      const userName = profile?.nome || "";

      if (!isAdmin && userName) {
        projects = projects.filter(p => p.responsavel === userName);
        const projectIds = new Set(projects.map(p => p.id));
        tasks = tasks.filter(t =>
          projectIds.has(t.projeto_id) || (t.responsavel && t.responsavel.includes(userName))
        );
        costs = costs.filter(c => projectIds.has(c.projeto_id));
      }

      // Metrics
      const activeProjects = projects.filter(p => p.status === "Ativo").length;
      const tasksInProgress = tasks.filter(t => t.status === "Em Andamento").length;
      const tasksCompleted = tasks.filter(t => t.status === "Concluído").length;
      const tasksOverdue = tasks.filter(t => {
        const urgency = getTaskUrgency(t.data_fim, t.status);
        return urgency.label?.startsWith("Atrasada");
      }).length;
      const totalCosts = costs.reduce((sum, c) => sum + Number(c.valor), 0);

      // Tasks by status
      const aFazer = tasks.filter(t => t.status === "A Fazer").length;
      const emAndamento = tasksInProgress;
      const concluido = tasksCompleted;
      const tasksByStatus = [
        { name: "A Fazer", value: aFazer, fill: "hsl(220, 14%, 60%)" },
        { name: "Em Andamento", value: emAndamento, fill: "hsl(217, 91%, 60%)" },
        { name: "Concluído", value: concluido, fill: "hsl(142, 71%, 45%)" },
      ];

      // Tasks by deadline
      let onTime = 0, attention = 0, overdue = 0;
      tasks.filter(t => t.status !== "Concluído").forEach(t => {
        const u = getTaskUrgency(t.data_fim, t.status);
        if (!u.label || u.label === "Prazo ok") onTime++;
        else if (u.label.startsWith("Atrasada")) overdue++;
        else attention++;
      });
      const tasksByDeadline = [
        { name: "No prazo", value: onTime, fill: "hsl(142, 71%, 45%)" },
        { name: "Atenção", value: attention, fill: "hsl(38, 92%, 50%)" },
        { name: "Atrasadas", value: overdue, fill: "hsl(0, 84%, 60%)" },
      ];

      // Costs by category
      const costMap = new Map<string, number>();
      costs.forEach(c => {
        costMap.set(c.categoria, (costMap.get(c.categoria) || 0) + Number(c.valor));
      });
      const costsByCategory = Array.from(costMap.entries()).map(([name, value]) => ({ name, value }));

      // Critical tasks (overdue + due today/tomorrow, max 10)
      const projectMap = new Map(projects.map(p => [p.id, p.nome]));
      const criticalTasks = tasks
        .filter(t => {
          if (t.status === "Concluído") return false;
          const u = getTaskUrgency(t.data_fim, t.status);
          return u.label?.startsWith("Atrasada") || u.label === "Vence hoje" || u.label === "Vence amanhã";
        })
        .map(t => ({ ...t, projectName: projectMap.get(t.projeto_id) || "" }))
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
        metrics: { activeProjects, tasksInProgress, tasksCompleted, tasksOverdue, totalCosts },
        tasksByStatus,
        tasksByDeadline,
        costsByCategory,
        criticalTasks,
      } as DashboardData;
    },
    enabled: !!profile,
  });
}
