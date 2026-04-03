import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, Calendar, Clock } from "lucide-react";
import { useMyTasks, type MyTask } from "@/hooks/useMyTasks";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
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
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Concluído": "bg-green-100 text-green-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  Baixa: "bg-gray-100 text-gray-700",
  Média: "bg-yellow-100 text-yellow-800",
  Alta: "bg-red-100 text-red-800",
};

type GroupKey = "today" | "thisWeek" | "nextWeek" | "later" | "noDate";

const GROUP_LABELS: Record<GroupKey, string> = {
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
    else groups.later.push(task); // past
  });
  return groups;
}

export default function MyWork() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useMyTasks();
  const { data: projects = [] } = useProjects();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();

  const [projectSelectOpen, setProjectSelectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);

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
      },
      { onSuccess: () => toast.success("Tarefa criada!") }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
          <Button onClick={openNewTask}>
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
              <p className="text-sm">Quando você for adicionado como responsável, suas tarefas aparecerão aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {(Object.keys(GROUP_LABELS) as GroupKey[]).map((key) => {
              const items = grouped[key];
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    {key === "today" ? <Calendar className="h-4 w-4 text-muted-foreground" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    <h2 className="font-semibold text-lg">{GROUP_LABELS[key]}</h2>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((task) => (
                      <Card key={task.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-36 shrink-0">
                              <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v)}>
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
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{task.nome}</p>
                              <p className="text-xs text-muted-foreground truncate">📁 {task.projeto_nome}</p>
                            </div>
                            {task.responsavel && task.responsavel.length > 0 && (
                              <div className="hidden md:flex gap-1 shrink-0">
                                {task.responsavel.map((r) => (
                                  <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                                ))}
                              </div>
                            )}
                            {task.prioridade && (
                              <Badge className={`text-xs shrink-0 ${PRIORITY_COLORS[task.prioridade] || ""}`}>
                                {task.prioridade}
                              </Badge>
                            )}
                            {task.data_inicio && (
                              <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">📅 {task.data_inicio}</span>
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

      {/* Project selection dialog */}
      <Dialog open={projectSelectOpen} onOpenChange={setProjectSelectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <Button className="w-full" disabled={!selectedProjectId} onClick={confirmProject}>
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task form */}
      <TaskForm open={taskFormOpen} onOpenChange={setTaskFormOpen} onSubmit={handleCreateTask} />
    </div>
  );
}
