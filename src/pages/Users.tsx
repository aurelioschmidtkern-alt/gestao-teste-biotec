import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, UserCheck, UserX } from "lucide-react";
import { UserForm } from "@/components/UserForm";
import { useUsers, useCreateUser, useUpdateUser, type UserProfile } from "@/hooks/useUsers";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PROFILE_COLORS: Record<string, string> = {
  Administrador: "bg-blue-100 text-blue-700",
  Coordenador: "bg-violet-100 text-violet-700",
  Funcionario: "bg-secondary text-secondary-foreground",
};

const STATUS_BADGE: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Inativo: "bg-red-100 text-red-700",
};

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Users() {
  const navigate = useNavigate();
  const { canManageUsers, isLoading: permissionsLoading } = usePermissions();
  const { data: users = [], isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!permissionsLoading && !canManageUsers) navigate("/", { replace: true });
  }, [canManageUsers, permissionsLoading, navigate]);

  const handleCreate = (data: { nome: string; email: string; password: string; perfil: string }) => {
    createUser.mutate(data, {
      onSuccess: () => toast.success("Usuário criado!"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleEdit = (data: { nome: string; password: string; perfil: string }) => {
    if (!editingUser) return;
    updateUser.mutate({
      user_id: editingUser.user_id,
      nome: data.nome,
      perfil: data.perfil,
      ...(data.password ? { password: data.password } : {}),
    }, {
      onSuccess: () => { toast.success("Usuário atualizado!"); setEditingUser(null); },
      onError: (e) => toast.error(e.message),
    });
  };

  const toggleStatus = (user: UserProfile) => {
    const newStatus = user.status === "Ativo" ? "Inativo" : "Ativo";
    updateUser.mutate({ user_id: user.user_id, status: newStatus }, {
      onSuccess: () => toast.success(`Usuário ${newStatus === "Ativo" ? "ativado" : "inativado"}`),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </motion.div>

      {error ? (
        <Card className="shadow-sm border-border/50">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center text-muted-foreground py-12">Carregando usuários...</div>
      ) : (
        <motion.div variants={fadeInUp}>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Lista de Usuários ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block divide-y divide-border/50">
                <div className="grid grid-cols-[1fr_1fr_120px_100px_100px_80px] gap-4 pb-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Nome</span>
                  <span>Email</span>
                  <span>Perfil</span>
                  <span>Status</span>
                  <span>Data</span>
                  <span></span>
                </div>
                {users.map(u => (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_1fr_120px_100px_100px_80px] gap-4 py-3.5 items-center hover:bg-muted/30 transition-colors rounded-lg -mx-2 px-2"
                  >
                    <span className="font-medium text-sm">{u.nome}</span>
                    <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                    <span>
                      <Badge className={`rounded-full text-xs ${PROFILE_COLORS[u.perfil] || ""}`}>{u.perfil}</Badge>
                    </span>
                    <span>
                      <Badge className={`rounded-full text-xs ${STATUS_BADGE[u.status] || ""}`}>{u.status}</Badge>
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                    <div className="flex gap-0.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingUser(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => toggleStatus(u)}>
                        {u.status === "Ativo" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {users.map(u => (
                  <div key={u.id} className="p-3 rounded-lg border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{u.nome}</span>
                      <div className="flex gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingUser(u)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => toggleStatus(u)}>
                          {u.status === "Ativo" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full text-xs ${PROFILE_COLORS[u.perfil] || ""}`}>{u.perfil}</Badge>
                      <Badge className={`rounded-full text-xs ${STATUS_BADGE[u.status] || ""}`}>{u.status}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(u.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <UserForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <UserForm open={!!editingUser} onOpenChange={open => { if (!open) setEditingUser(null); }} onSubmit={handleEdit} initial={editingUser} />
    </motion.div>
  );
}
