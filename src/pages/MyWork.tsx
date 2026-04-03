import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, Calendar, Clock } from "lucide-react";
import { useMyTasks, type MyTask } from "@/hooks/useMyTasks";
import { useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { TaskForm } from "@/components/TaskForm";
import { toast } from "sonner";
import {
  isToday,
  isThisWeek,
  addWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
  isBefore,
  isAfter,
} from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  "A Fazer": "bg-muted text-muted-foreground",
  "Em Andamento": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Concluído": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Baixa": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Média": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "Alta": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

type GroupKey = "today" | "thisWeek" | "nextWeek" | "later" | "noDate";

const GROUP_LABELS: Record<GroupKey, string> = {
  today: "Hoje",
  thisWeek: "Esta Semana",
  nextWeek: "Semana que Vem",
  later: "Mais Tarde",
  noDate: "Sem Data",
};

const GROUP_ICONS: Record<GroupKey, typeof Calendar> = {
  today: Calendar,
  thisWeek: Clock,
  nextWeek: Clock,
  later: Clock,
  noDate: Calendar,
};

function groupTasks(tasks: MyTask[]): Record<GroupKey, MyTask[]> {
  const groups: Record<GroupKey, MyTask[]> = {
    today: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
    noDate: [],
  };

  const now = new Date();
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const nextWeekEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });

  tasks.forEach((task) => {
    if (!task.data_inicio) {
      groups.noDate.push(task);
      return;
    }
    const date = parseISO(task.data_inicio);
    if (isToday(date)) {
      groups.today.push(task);
    } else if (isThisWeek(date, { weekStartsOn: 1 }) && !isToday(date)) {
      groups.thisWeek.push(task);
    } else if (!isBefore(date, nextWeekStart) && !isAfter(date, nextWeekEnd)) {
      groups.nextWeek.push(task);
    } else if (isAfter(date, nextWeekEnd)) {
      groups.later.push(task);
    } else {
      // Past dates that aren't today/this week go to "later" or could be a separate group
      groups.later.push(task);
    }
  });

  return groups;
}

export default function MyWork() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useMyTasks();
  const { data: projects = [] } = useProjects();
  const updateTask = useUpdateTask();
  const { signOut } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const grouped = groupTasks(tasks);

  const handleStatusChange = (task: MyTask, newStatus: string) => {
    updateTask.mutate(
      { id: task.id, projeto_id: task.projeto_id, status: newStatus },
      { onSuccess: () => toast.success(`Status alterado para "${newStatus}"`) }
    );
  };

  const handleCreateTask = (data: any) => {
    // Will be handled via TaskForm with project selection
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Meu Trabalho</h1>
              <p className="text-muted-foreground">Todas as suas tarefas em um só lugar</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Elemento
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando tarefas...</div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Nenhuma tarefa atribuída a você</p>
              <p className="text-sm">Quando você for adicionado como responsável em uma tarefa, ela aparecerá aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {(Object.keys(GROUP_LABELS) as GroupKey[]).map((groupKey) => {
              const groupTasks = grouped[groupKey];
              if (groupTasks.length === 0) return null;
              const Icon = GROUP_ICONS[groupKey];
              return (
                <div key={groupKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold text-lg">{GROUP_LABELS[groupKey]}</h2>
                    <Badge variant="secondary">{groupTasks.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Status Select */}
                            <div className="w-36 shrink-0">
                              <Select
                                value={task.status}
                                onValueChange={(val) => handleStatusChange(task, val)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A Fazer">A Fazer</SelectItem>
                                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                  <SelectItem value="Concluído">Concluído</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Task Name */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{task.nome}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                📁 {task.projeto_nome}
                              </p>
                            </div>

                            {/* Responsáveis */}
                            {task.responsavel && task.responsavel.length > 0 && (
                              <div className="hidden md:flex gap-1 shrink-0">
                                {task.responsavel.map((r) => (
                                  <Badge key={r} variant="outline" className="text-xs">
                                    {r}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Prioridade */}
                            {task.prioridade && (
                              <Badge className={`text-xs shrink-0 ${PRIORITY_COLORS[task.prioridade] || ""}`}>
                                {task.prioridade}
                              </Badge>
                            )}

                            {/* Data */}
                            {task.data_inicio && (
                              <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                                📅 {task.data_inicio}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task creation dialog with project selection */}
      {formOpen && (
        <TaskFormWithProject
          open={formOpen}
          onOpenChange={setFormOpen}
          projects={projects}
        />
      )}
    </div>
  );
}

function TaskFormWithProject({
  open,
  onOpenChange,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; nome: string }[];
}) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { useCreateTask } = require("@/hooks/useTasks");
  const createTask = useCreateTask();

  if (!selectedProjectId) {
    return (
      <div>
        {/* Project selection step */}
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Escolha o projeto para a nova tarefa:</p>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <TaskForm
      open={open}
      onOpenChange={(o) => {
        if (!o) setSelectedProjectId("");
        onOpenChange(o);
      }}
      onSubmit={(data) => {
        createTask.mutate(
          {
            projeto_id: selectedProjectId,
            nome: data.nome,
            descricao: data.descricao || null,
            responsaveis: data.responsaveis,
            data_inicio: data.data_inicio || null,
            data_fim: data.data_fim || null,
            status: data.status,
          } as any,
          { onSuccess: () => toast.success("Tarefa criada!") }
        );
      }}
    />
  );
}

// Need to import Dialog components for the project selection step
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
