import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, type Tarefa } from "@/hooks/useTasks";
import { toast } from "sonner";

const COLUMNS = ["A Fazer", "Em Andamento", "Concluído"] as const;
const COLUMN_COLORS: Record<string, string> = {
  "A Fazer": "bg-muted",
  "Em Andamento": "bg-blue-50 dark:bg-blue-950",
  "Concluído": "bg-green-50 dark:bg-green-950",
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
      responsavel: data.responsavel || null,
      data_inicio: data.data_inicio || null,
      data_fim: data.data_fim || null,
      status: data.status,
    }, { onSuccess: () => toast.success("Tarefa criada!") });
  };

  const handleEdit = (data: any) => {
    if (!editingTask) return;
    updateTask.mutate({
      id: editingTask.id,
      projeto_id: projetoId,
      nome: data.nome,
      descricao: data.descricao || null,
      responsavel: data.responsavel || null,
      data_inicio: data.data_inicio || null,
      data_fim: data.data_fim || null,
    }, { onSuccess: () => { toast.success("Tarefa atualizada!"); setEditingTask(null); } });
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando tarefas...</div>;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className={`rounded-lg p-3 ${COLUMN_COLORS[col]}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{col} <Badge variant="secondary" className="ml-1">{colTasks.length}</Badge></h3>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setFormColumn(col); setFormOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Droppable droppableId={col}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
                            >
                              <CardHeader className="p-3 pb-1">
                                <div className="flex items-start gap-1">
                                  <span {...provided.dragHandleProps}><GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" /></span>
                                  <CardTitle className="text-sm flex-1">{task.nome}</CardTitle>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingTask(task)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteTask.mutate({ id: task.id, projeto_id: projetoId }, { onSuccess: () => toast.success("Tarefa excluída") })}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 pt-0 text-xs text-muted-foreground space-y-1">
                                {task.responsavel && <div>👤 {task.responsavel}</div>}
                                {task.data_inicio && <div>📅 {task.data_inicio}{task.data_fim ? ` → ${task.data_fim}` : ""}</div>}
                              </CardContent>
                            </Card>
                          )}
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
