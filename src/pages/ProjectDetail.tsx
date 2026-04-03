import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CostsList } from "@/components/CostsList";
import { ProjectForm } from "@/components/ProjectForm";
import { useUpdateProject } from "@/hooks/useProjects";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-green-100 text-green-800",
  Pausado: "bg-yellow-100 text-yellow-800",
  Concluído: "bg-blue-100 text-blue-800",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateProject = useUpdateProject();
  const [editOpen, setEditOpen] = useState(false);
  const { canEditProject, canAccessCosts } = usePermissions();

  const { data: projeto, isLoading } = useQuery({
    queryKey: ["projeto", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projetos").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Carregando...</div>;
  if (!projeto) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Projeto não encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{projeto.nome}</h1>
            <Badge className={STATUS_COLORS[projeto.status] || ""}>{projeto.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {projeto.responsavel && `Responsável: ${projeto.responsavel} · `}
            Criado em {new Date(projeto.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {canEditProject && (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          {canAccessCosts && <TabsTrigger value="custos">Custos</TabsTrigger>}
        </TabsList>
        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard projetoId={projeto.id} />
        </TabsContent>
        {canAccessCosts && (
          <TabsContent value="custos" className="mt-4">
            <CostsList projetoId={projeto.id} />
          </TabsContent>
        )}
      </Tabs>

      <ProjectForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={projeto}
        onSubmit={(data) => {
          updateProject.mutate({ id: projeto.id, ...data }, {
            onSuccess: () => toast.success("Projeto atualizado!"),
          });
        }}
      />
    </div>
  );
}
