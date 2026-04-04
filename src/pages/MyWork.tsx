import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, FolderOpen, AlertTriangle } from "lucide-react";
import { useMyTasks, type MyTask } from "@/hooks/useMyTasks";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { TaskForm } from "@/components/TaskForm";
import { toast } from "sonner";
import { getTaskUrgency } from "@/lib/taskUrgency";
import { motion, AnimatePresence } from "framer-motion";
import {
  isToday,
  isThisWeek,
  addWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  "A Fazer": "bg-secondary text-secondary-foreground",
  "Em Andamento": "bg-blue-100 text-blue-700",
  "Concluído": "bg-emerald-100 text-emerald-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  Baixa: "bg-secondary text-secondary-foreground",
  Média: "bg-amber-100 text-amber-700",
  Alta: "bg-red-100 text-red-700",
};

type GroupKey = "overdue" | "today" | "thisWeek" | "nextWeek" | "later" | "noDate";

const GROUP_LABELS: Record<GroupKey, string> = {
  overdue: "Atrasadas",
  today: "Hoje",
  thisWeek: "Esta Semana",
  nextWeek: "Semana que Vem",
  later: "Mais Tarde",
  noDate: "Sem Data",
};

function groupTasksByDate(tasks: MyTask[]): Record<GroupKey, MyTask[]> {
  const groups: Record<GroupKey, MyTask[]> = { today: [], thisWeek: [], nextWeek: [], later: [], noDate: [] };
  const now = new Date();
  const nwStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const nwEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });

  tasks.forEach((task) => {
    if (!task.data_inicio) { groups.noDate.push(task); return; }
    const d = parseISO(task.data_inicio);
    if (isToday(d)) groups.today.push(task);
    else if (isThisWeek(d, { weekStartsOn: 1 })) groups.thisWeek.push(task);
    else if (!isBefore(d, nwStart) && !isAfter(d, nwEnd)) groups.nextWeek.push(task);
    else if (isAfter(d, nwEnd)) groups.later.push(task);
    else groups.later.push(task);
  });
  return groups;
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export default function MyWork() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useMyTasks();
  const { data: projects = [] } = useProjects();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();

  const [projectSelectOpen, setProjectSelectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const grouped = groupTasksByDate(tasks);

  const handleStatusChange = (task: MyTask, newStatus: string) => {
    updateTask.mutate(
      { id: task.id, projeto_id: task.projeto_id, status: newStatus },
      { onSuccess: () => toast.success(`Status alterado para "${newStatus}"`) }
    );
  };

  const openNewTask = () => {
    setSelectedProjectId("");
    setProjectSelectOpen(true);
  };

  const confirmProject = () => {
    if (!selectedProjectId) return;
    setProjectSelectOpen(false);
    setTaskFormOpen(true);
  };

  const handleCreateTask = (data: any) => {
    createTask.mutate(
      {
        projeto_id: selectedProjectId,
        nome: data.nome,
        descricao: data.descricao || null,
        responsavel: data.responsaveis?.length > 0 ? data.responsaveis : null,
        data_inicio: data.data_inicio || null,
        data_fim: data.data_fim || null,
        status: data.status,
        prioridade: data.prioridade || null,
      },
      { onSuccess: () => toast.success("Tarefa criada!") }
    );
  };

  return (
    <motion.div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8" initial="initial" animate="animate" variants={stagger}>
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Meu Trabalho</h1>
          <p className="text-sm text-muted-foreground mt-1">Todas as suas tarefas em um só lugar</p>
        </div>
        <Button onClick={openNewTask} className="shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Novo Elemento
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Carregando tarefas...</div>
      ) : tasks.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Nenhuma tarefa atribuída a você</p>
              <p className="text-sm mt-1">Quando você for adicionado como responsável, suas tarefas aparecerão aqui</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(GROUP_LABELS) as GroupKey[]).map((key) => {
            const items = grouped[key];
            if (items.length === 0) return null;
            return (
              <motion.div key={key} variants={fadeInUp}>
                <div className="flex items-center gap-2.5 mb-3">
                  {key === "today" ? <Calendar className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  <h2 className="font-semibold text-base">{GROUP_LABELS[key]}</h2>
                  <Badge variant="secondary" className="rounded-full text-xs">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((task) => {
                    const urgency = getTaskUrgency(task.data_fim, task.status);
                    return (
                      <Card
                        key={task.id}
                        className={`shadow-sm border-border/50 hover:shadow-md transition-all duration-200 border-l-[3px] cursor-pointer ${urgency.borderClass}`}
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-28 sm:w-36 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v)}>
                                  <SelectTrigger className="h-8 text-xs rounded-lg">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A Fazer">A Fazer</SelectItem>
                                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                    <SelectItem value="Concluído">Concluído</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{task.nome}</p>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                  <FolderOpen className="h-3 w-3" /> {task.projeto_nome}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pl-0 sm:pl-0 sm:shrink-0">
                              {task.responsavel && task.responsavel.length > 0 && (
                                <div className="hidden md:flex gap-1 shrink-0">
                                  {task.responsavel.map((r) => (
                                    <Badge key={r} variant="outline" className="text-xs rounded-full">{r}</Badge>
                                  ))}
                                </div>
                              )}
                              {task.prioridade && (
                                <Badge className={`text-xs shrink-0 rounded-full ${PRIORITY_COLORS[task.prioridade] || ""}`}>
                                  {task.prioridade}
                                </Badge>
                              )}
                              {task.data_inicio && (
                                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{task.data_inicio}</span>
                              )}
                              {urgency.label && (
                                <Badge variant="outline" className="text-xs shrink-0 rounded-full">{urgency.label}</Badge>
                              )}
                            </div>
                          </div>
                          <AnimatePresence>
                            {expandedTaskId === task.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
                                exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-border/50 pt-3 mt-3">
                                  <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${!task.descricao ? "italic" : ""}`}>
                                    {task.descricao || "Sem descrição"}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={projectSelectOpen} onOpenChange={setProjectSelectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Escolha o projeto para a nova tarefa:</p>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecionar projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full h-11" disabled={!selectedProjectId} onClick={confirmProject}>
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TaskForm open={taskFormOpen} onOpenChange={setTaskFormOpen} onSubmit={handleCreateTask} />
    </motion.div>
  );
}
