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
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Pausado: "bg-amber-100 text-amber-700",
  Concluído: "bg-secondary text-secondary-foreground",
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
    <motion.div
      className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9 hover:bg-muted/50 shrink-0 self-start">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{projeto.nome}</h1>
            <Badge className={`rounded-full ${STATUS_COLORS[projeto.status] || ""}`}>{projeto.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projeto.responsavel && `Responsável: ${projeto.responsavel} · `}
            Criado em {new Date(projeto.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {canEditProject && (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="shadow-sm w-full sm:w-auto">
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          {canAccessCosts && <TabsTrigger value="custos">Custos</TabsTrigger>}
        </TabsList>
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard projetoId={projeto.id} />
        </TabsContent>
        {canAccessCosts && (
          <TabsContent value="custos" className="mt-6">
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
    </motion.div>
  );
}
