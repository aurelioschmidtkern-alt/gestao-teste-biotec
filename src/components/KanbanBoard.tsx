import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, type Tarefa } from "@/hooks/useTasks";
import { toast } from "sonner";
import { getTaskUrgency } from "@/lib/taskUrgency";

const COLUMNS = ["A Fazer", "Em Andamento", "Concluído"] as const;

const COLUMN_STYLES: Record<string, { header: string; bg: string; border: string }> = {
  "A Fazer": {
    header: "bg-slate-600",
    bg: "bg-slate-50/50 dark:bg-slate-900/30",
    border: "border-slate-200 dark:border-slate-800",
  },
  "Em Andamento": {
    header: "bg-blue-600",
    bg: "bg-blue-50/30 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  "Concluído": {
    header: "bg-emerald-600",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

const URGENCY_BORDER: Record<string, string> = {
  "border-l-green-500": "border-l-emerald-400",
  "border-l-yellow-500": "border-l-amber-400",
  "border-l-red-500": "border-l-red-400",
};

export function KanbanBoard({ projetoId }: { projetoId: string }) {
  const { data: tasks = [], isLoading } = useTasks(projetoId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [formOpen, setFormOpen] = useState(false);
  const [formColumn, setFormColumn] = useState<string>("A Fazer");
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const taskId = result.draggableId;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    updateTask.mutate({ id: taskId, projeto_id: projetoId, status: newStatus }, {
      onSuccess: () => toast.success(`Tarefa movida para "${newStatus}"`),
    });
  };

  const handleCreate = (data: any) => {
    createTask.mutate({
      projeto_id: projetoId,
      nome: data.nome,
      descricao: data.descricao || null,
      responsavel: data.responsaveis.length > 0 ? data.responsaveis : null,
      data_inicio: data.data_inicio || null,
      data_fim: data.data_fim || null,
      status: data.status,
      prioridade: data.prioridade || null,
    }, { onSuccess: () => toast.success("Tarefa criada!") });
  };

  const handleEdit = (data: any) => {
    if (!editingTask) return;
    updateTask.mutate({
      id: editingTask.id,
      projeto_id: projetoId,
      nome: data.nome,
      descricao: data.descricao || null,
      responsavel: data.responsaveis.length > 0 ? data.responsaveis : null,
      data_inicio: data.data_inicio || null,
      data_fim: data.data_fim || null,
      prioridade: data.prioridade || null,
    }, { onSuccess: () => { toast.success("Tarefa atualizada!"); setEditingTask(null); } });
  };

  const formatResponsaveis = (responsavel: string | string[] | null) => {
    if (!responsavel) return null;
    if (Array.isArray(responsavel)) return responsavel.join(", ");
    return responsavel;
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando tarefas...</div>;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            const style = COLUMN_STYLES[col];
            return (
              <div key={col} className={`rounded-xl overflow-hidden border ${style.border} ${style.bg}`}>
                {/* Column Header */}
                <div className={`${style.header} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">{col}</h3>
                    <span className="text-xs bg-white/20 text-white rounded-full px-2 py-0.5">{colTasks.length}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => { setFormColumn(col); setFormOpen(true); }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Cards */}
                <Droppable droppableId={col}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-2.5 min-h-[120px]">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => {
                            const urgency = getTaskUrgency(task.data_fim, task.status);
                            return (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing border-l-[3px] shadow-sm hover:shadow-md transition-all duration-200 group ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30 rotate-1" : ""
                                } ${urgency.borderClass}`}
                              >
                                <CardHeader className="p-3 pb-1">
                                  <div className="flex items-start gap-1.5">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 group-hover:text-muted-foreground/60 transition-colors" />
                                    <CardTitle className="text-sm flex-1 font-medium">{task.nome}</CardTitle>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingTask(task)}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteTask.mutate({ id: task.id, projeto_id: projetoId }, { onSuccess: () => toast.success("Tarefa excluída") })}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-1.5">
                                  {formatResponsaveis(task.responsavel) && (
                                    <div className="flex items-center gap-1">
                                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
                                        {(Array.isArray(task.responsavel) ? task.responsavel[0] : task.responsavel || "?").charAt(0).toUpperCase()}
                                      </div>
                                      <span className="truncate">{formatResponsaveis(task.responsavel)}</span>
                                    </div>
                                  )}
                                  {task.data_inicio && (
                                    <div className="text-muted-foreground/70">
                                      {task.data_inicio}{task.data_fim ? ` → ${task.data_fim}` : ""}
                                    </div>
                                  )}
                                  {urgency.label && (
                                    <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">{urgency.label}</Badge>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} defaultStatus={formColumn} />
      <TaskForm open={!!editingTask} onOpenChange={open => { if (!open) setEditingTask(null); }} onSubmit={handleEdit} initial={editingTask} />
    </>
  );
}
