import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, ListChecks, CheckCircle2, AlertTriangle, DollarSign, Plus } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useProjects } from "@/hooks/useProjects";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCurrency } from "@/hooks/useCosts";
import { getTaskUrgency } from "@/lib/taskUrgency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Pausado: "bg-amber-100 text-amber-700",
  Concluído: "bg-secondary text-secondary-foreground",
};

const CHART_COLORS = ["hsl(220, 14%, 60%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)"];
const COST_COLORS = [
  "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(280, 65%, 60%)", "hsl(190, 80%, 50%)",
];

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projectsList } = useProjects();
  const { data, isLoading } = useDashboard(selectedProjectId);
  const { canCreateProject } = usePermissions();

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <p className="text-center text-muted-foreground py-12">Carregando dashboard...</p>
      </div>
    );
  }

  const { metrics, tasksByStatus, tasksByDeadline, costsByCategory, criticalTasks, projects, tasks } = displayData;

  const metricCards = [
    { icon: FolderOpen, value: metrics.activeProjects, label: "Projetos ativos", color: "bg-primary/10 text-primary" },
    { icon: ListChecks, value: metrics.tasksInProgress, label: "Em andamento", color: "bg-blue-100 text-blue-600" },
    { icon: CheckCircle2, value: metrics.tasksCompleted, label: "Concluídas", color: "bg-emerald-100 text-emerald-600" },
    { icon: AlertTriangle, value: metrics.tasksOverdue, label: "Atrasadas", color: "bg-red-100 text-red-600", valueClass: "text-destructive" },
    { icon: DollarSign, value: formatCurrency(metrics.totalCosts), label: "Total custos", color: "bg-emerald-100 text-emerald-600", isText: true },
  ];

  return (
    <motion.div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8" initial="initial" animate="animate" variants={stagger}>
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedProjectId || "all"}
            onValueChange={(v) => setSelectedProjectId(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-10">
              <SelectValue placeholder="Todos os projetos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {(allData?.projects || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canCreateProject && (
            <Button onClick={() => navigate("/")} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Novo Projeto
            </Button>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" variants={stagger}>
        {metricCards.map((m, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${m.color}`}>
                    <m.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${m.valueClass || ""}`}>
                      {m.isText ? m.value : m.value}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={stagger}>
        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tarefas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                "A Fazer": { label: "A Fazer", color: CHART_COLORS[0] },
                "Em Andamento": { label: "Em Andamento", color: CHART_COLORS[1] },
                "Concluído": { label: "Concluído", color: CHART_COLORS[2] },
              }} className="h-[220px] w-full !aspect-auto">
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
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tarefas por Prazo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                "No prazo": { label: "No prazo", color: "hsl(142, 71%, 45%)" },
                "Atenção": { label: "Atenção", color: "hsl(38, 92%, 50%)" },
                "Atrasadas": { label: "Atrasadas", color: "hsl(0, 84%, 60%)" },
              }} className="h-[220px] w-full !aspect-auto">
                <BarChart data={tasksByDeadline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {tasksByDeadline.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Custos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {costsByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Nenhum custo registrado</p>
              ) : (
                <ChartContainer config={
                  Object.fromEntries(costsByCategory.map((c, i) => [c.name, { label: c.name, color: COST_COLORS[i % COST_COLORS.length] }]))
                } className="h-[220px] w-full !aspect-auto">
                  <BarChart data={costsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {costsByCategory.map((_, i) => (
                        <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Projects + Critical Tasks */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={stagger}>
        <motion.div className="space-y-4" variants={fadeInUp}>
          {!selectedProjectId ? (
            <>
              {(["Ativo", "Pausado", "Concluído"] as const).map(status => {
                const filtered = projects.filter(p => p.status === status);
                if (filtered.length === 0) return null;
                const sectionTitles: Record<string, string> = {
                  Ativo: "Projetos Ativos",
                  Pausado: "Projetos Pausados",
                  Concluído: "Projetos Concluídos",
                };
                return (
                  <Card key={status} className="shadow-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">{sectionTitles[status]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {filtered.map(p => {
                          const projectTasks = tasks.filter(t => t.projeto_id === p.id);
                          const done = projectTasks.filter(t => t.status === "Concluído").length;
                          const total = projectTasks.length;
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 group"
                              onClick={() => navigate(`/projeto/${p.id}`)}
                            >
                              <div className="space-y-0.5">
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">{p.nome}</p>
                                <p className="text-xs text-muted-foreground">{p.responsavel || "Sem responsável"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs rounded-full">{done}/{total}</Badge>
                                <Badge className={`text-xs rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {projects.length === 0 && (
                <Card className="shadow-sm border-border/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum projeto encontrado</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Projeto Selecionado</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (() => {
                  const p = projects[0];
                  const projectTasks = tasks.filter(t => t.projeto_id === p.id);
                  const aFazer = projectTasks.filter(t => t.status === "A Fazer").length;
                  const emAnd = projectTasks.filter(t => t.status === "Em Andamento").length;
                  const done = projectTasks.filter(t => t.status === "Concluído").length;
                  return (
                    <div
                      className="p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 space-y-3"
                      onClick={() => navigate(`/projeto/${p.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-lg">{p.nome}</p>
                        <Badge className={`rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.responsavel || "Sem responsável"}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs rounded-full">{aFazer} A Fazer</Badge>
                        <Badge variant="outline" className="text-xs rounded-full text-blue-600 border-blue-200">{emAnd} Em Andamento</Badge>
                        <Badge variant="outline" className="text-xs rounded-full text-emerald-600 border-emerald-200">{done} Concluídas</Badge>
                      </div>
                    </div>
                  );
                })() : (
                  <p className="text-sm text-muted-foreground text-center py-8">Projeto não encontrado</p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tarefas Críticas</CardTitle>
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
                        className={`p-3 rounded-lg border-l-[3px] ${urgency.borderClass} cursor-pointer hover:bg-muted/50 transition-all duration-200`}
                        onClick={() => navigate(`/projeto/${t.projeto_id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">{t.nome}</p>
                            <p className="text-xs text-muted-foreground">{t.projectName}</p>
                          </div>
                          <div className="text-right space-y-1">
                            {urgency.label && (
                              <Badge variant="destructive" className="text-xs rounded-full">{urgency.label}</Badge>
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
