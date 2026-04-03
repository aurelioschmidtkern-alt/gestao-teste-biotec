import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Trash2, Users, ClipboardList } from "lucide-react";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { ProjectForm } from "@/components/ProjectForm";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-green-100 text-green-800",
  Pausado: "bg-yellow-100 text-yellow-800",
  Concluído: "bg-blue-100 text-blue-800",
};

export default function Index() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const { signOut } = useAuth();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">Gerencie seus projetos, tarefas e custos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/meu-trabalho")}><ClipboardList className="h-4 w-4 mr-2" /> Meu Trabalho</Button>
            <Button variant="outline" onClick={() => navigate("/usuarios")}><Users className="h-4 w-4 mr-2" /> Usuários</Button>
            <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" /> Novo Projeto</Button>
            <Button variant="outline" onClick={() => signOut().then(() => navigate("/auth"))}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando projetos...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm">Crie seu primeiro projeto para começar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projeto/${p.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{p.nome}</CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        deleteProject.mutate(p.id, { onSuccess: () => toast.success("Projeto excluído") });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge className={STATUS_COLORS[p.status] || ""}>{p.status}</Badge>
                  {p.responsavel && <p className="text-sm text-muted-foreground">👤 {p.responsavel}</p>}
                  <p className="text-xs text-muted-foreground">Criado em {new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => {
          createProject.mutate(data, { onSuccess: () => toast.success("Projeto criado!") });
        }}
      />
    </div>
  );
}
