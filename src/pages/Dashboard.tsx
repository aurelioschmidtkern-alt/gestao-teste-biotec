import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FolderOpen, ListChecks, CheckCircle2, AlertTriangle, DollarSign, Plus } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useDashboard } from "@/hooks/useDashboard";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency } from "@/hooks/useCosts";
import { getTaskUrgency } from "@/lib/taskUrgency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-green-100 text-green-800",
  Pausado: "bg-yellow-100 text-yellow-800",
  Concluído: "bg-blue-100 text-blue-800",
};

const CHART_COLORS = ["hsl(220, 14%, 60%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)"];
const COST_COLORS = [
  "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(280, 65%, 60%)", "hsl(190, 80%, 50%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const { profile } = useProfile();
  const isAdmin = profile?.perfil === "Administrador";

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <p className="text-center text-muted-foreground py-12">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const { metrics, tasksByStatus, tasksByDeadline, costsByCategory, criticalTasks, projects, tasks } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate("/")}><Plus className="h-4 w-4 mr-2" /> Novo Projeto</Button>
            )}
            <UserMenu />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{metrics.activeProjects}</p>
                  <p className="text-xs text-muted-foreground">Projetos ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ListChecks className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.tasksInProgress}</p>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{metrics.tasksOverdue}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-lg font-bold">{formatCurrency(metrics.totalCosts)}</p>
                  <p className="text-xs text-muted-foreground">Total custos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Donut - Tasks by Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tarefas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                "A Fazer": { label: "A Fazer", color: CHART_COLORS[0] },
                "Em Andamento": { label: "Em Andamento", color: CHART_COLORS[1] },
                "Concluído": { label: "Concluído", color: CHART_COLORS[2] },
              }} className="h-[220px]">
                <PieChart>
                  <Pie data={tasksByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {tasksByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex justify-center gap-4 mt-2">
                {tasksByStatus.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="text-muted-foreground">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar - Tasks by Deadline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tarefas por Prazo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                "No prazo": { label: "No prazo", color: "hsl(142, 71%, 45%)" },
                "Atenção": { label: "Atenção", color: "hsl(38, 92%, 50%)" },
                "Atrasadas": { label: "Atrasadas", color: "hsl(0, 84%, 60%)" },
              }} className="h-[220px]">
                <BarChart data={tasksByDeadline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {tasksByDeadline.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Bar - Costs by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Custos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {costsByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Nenhum custo registrado</p>
              ) : (
                <ChartContainer config={
                  Object.fromEntries(costsByCategory.map((c, i) => [c.name, { label: c.name, color: COST_COLORS[i % COST_COLORS.length] }]))
                } className="h-[220px]">
                  <BarChart data={costsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {costsByCategory.map((_, i) => (
                        <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projects + Critical Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Projects */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Projetos em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.filter(p => p.status === "Ativo").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum projeto ativo</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {projects.filter(p => p.status === "Ativo").map(p => {
                    const projectTasks = tasks.filter(t => t.projeto_id === p.id);
                    const done = projectTasks.filter(t => t.status === "Concluído").length;
                    const total = projectTasks.length;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => navigate(`/projeto/${p.id}`)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{p.nome}</p>
                          <p className="text-xs text-muted-foreground">{p.responsavel || "Sem responsável"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">{done}/{total} tarefas</Badge>
                          <Badge className={STATUS_COLORS[p.status]}>{p.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critical Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tarefas Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              {criticalTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa crítica 🎉</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {criticalTasks.map(t => {
                    const urgency = getTaskUrgency(t.data_fim, t.status);
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border ${urgency.borderClass} cursor-pointer hover:bg-accent/50 transition-colors`}
                        onClick={() => navigate(`/projeto/${t.projeto_id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{t.nome}</p>
                            <p className="text-xs text-muted-foreground">{t.projectName}</p>
                          </div>
                          <div className="text-right space-y-1">
                            {urgency.label && (
                              <Badge variant="destructive" className="text-xs">{urgency.label}</Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {t.responsavel?.join(", ") || "Sem responsável"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
