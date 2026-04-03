import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Trash2, User } from "lucide-react";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import { ProjectForm } from "@/components/ProjectForm";
import { usePermissions } from "@/hooks/usePermissions";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Pausado: "bg-amber-100 text-amber-700",
  Concluído: "bg-secondary text-secondary-foreground",
};

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const getFadeTransition = (delay = 0) => ({
  duration: 0.4,
  delay,
  ease: "easeOut" as const,
});

export default function Index() {
  const navigate = useNavigate();
  const { data: allProjects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [formOpen, setFormOpen] = useState(false);
  const { canCreateProject, canDeleteProject, canViewAllProjects } = usePermissions();
  const { profile } = useProfile();
  const userName = profile?.nome || "";

  const { data: linkedProjectIds } = useQuery({
    queryKey: ["linked-project-ids", userName],
    queryFn: async () => {
      const { data } = await supabase
        .from("tarefas")
        .select("projeto_id")
        .contains("responsavel", [userName]);
      return new Set((data || []).map((t) => t.projeto_id));
    },
    enabled: !canViewAllProjects && !!userName,
  });

  const projects = canViewAllProjects
    ? allProjects
    : allProjects.filter(
        (p) => p.responsavel === userName || (linkedProjectIds && linkedProjectIds.has(p.id))
      );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={getFadeTransition()}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus projetos, tarefas e custos</p>
        </div>
        {canCreateProject && (
          <Button onClick={() => setFormOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Novo Projeto
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={getFadeTransition()}
        >
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm mt-1">Crie seu primeiro projeto para começar</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, index) => (
            <motion.div
              key={p.id}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={getFadeTransition(index * 0.05)}
            >
              <Card
                className="cursor-pointer shadow-sm border-border/50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group"
                onClick={() => navigate(`/projeto/${p.id}`)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{p.nome}</h3>
                    {canDeleteProject && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject.mutate(p.id, { onSuccess: () => toast.success("Projeto excluído") });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Badge className={`rounded-full text-xs ${STATUS_COLORS[p.status] || ""}`}>{p.status}</Badge>
                  {p.responsavel && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {p.responsavel}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60">
                    Criado em {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
