import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, FolderOpen, ClipboardList } from "lucide-react";
import { useDeletedProjects, useRestoreProject, usePermanentlyDeleteProject } from "@/hooks/useProjects";
import { useDeletedTasks, useRestoreTask, usePermanentlyDeleteTask } from "@/hooks/useTasks";
import { formatDateBR } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function Trash() {
  const { data: deletedProjects = [], isLoading: loadingProjects } = useDeletedProjects();
  const { data: deletedTasks = [], isLoading: loadingTasks } = useDeletedTasks();
  const restoreProject = useRestoreProject();
  const permanentlyDeleteProject = usePermanentlyDeleteProject();
  const restoreTask = useRestoreTask();
  const permanentlyDeleteTask = usePermanentlyDeleteTask();

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Lixeira</h1>
        <p className="text-sm text-muted-foreground mt-1">Itens excluídos podem ser restaurados ou removidos permanentemente</p>
      </div>

      <Tabs defaultValue="projetos">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="projetos" className="gap-1.5">
            <FolderOpen className="h-4 w-4" /> Projetos
            {deletedProjects.length > 0 && <Badge variant="secondary" className="rounded-full text-xs ml-1">{deletedProjects.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> Tarefas
            {deletedTasks.length > 0 && <Badge variant="secondary" className="rounded-full text-xs ml-1">{deletedTasks.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projetos" className="mt-6">
          {loadingProjects ? (
            <div className="text-center text-muted-foreground py-12">Carregando...</div>
          ) : deletedProjects.length === 0 ? (
            <Card className="shadow-sm border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Trash2 className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-lg font-medium">Nenhum projeto na lixeira</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {deletedProjects.map((p) => (
                <Card key={p.id} className="shadow-sm border-border/50">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{p.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Excluído em {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreProject.mutate(p.id, { onSuccess: () => toast.success("Projeto restaurado!") })}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O projeto "{p.nome}" será removido permanentemente. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => permanentlyDeleteProject.mutate(p.id, { onSuccess: () => toast.success("Projeto excluído permanentemente") })}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tarefas" className="mt-6">
          {loadingTasks ? (
            <div className="text-center text-muted-foreground py-12">Carregando...</div>
          ) : deletedTasks.length === 0 ? (
            <Card className="shadow-sm border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Trash2 className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-lg font-medium">Nenhuma tarefa na lixeira</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {deletedTasks.map((t: any) => (
                <Card key={t.id} className="shadow-sm border-border/50">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{t.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <FolderOpen className="h-3 w-3 inline mr-1" />
                        {t.projetos?.nome || "Projeto desconhecido"} · Excluído em {t.deleted_at ? new Date(t.deleted_at).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreTask.mutate({ id: t.id, projeto_id: t.projeto_id }, { onSuccess: () => toast.success("Tarefa restaurada!") })}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A tarefa "{t.nome}" será removida permanentemente. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => permanentlyDeleteTask.mutate({ id: t.id, projeto_id: t.projeto_id }, { onSuccess: () => toast.success("Tarefa excluída permanentemente") })}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
