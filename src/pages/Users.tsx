import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, UserCheck, UserX } from "lucide-react";
import { UserForm } from "@/components/UserForm";
import { useUsers, useCreateUser, useUpdateUser, type UserProfile } from "@/hooks/useUsers";
import { toast } from "sonner";

export default function Users() {
  const { data: users = [], isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center text-muted-foreground py-12">Carregando usuários...</div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lista de Usuários ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant={u.perfil === "Administrador" ? "default" : "secondary"}>{u.perfil}</Badge></TableCell>
                    <TableCell><Badge variant={u.status === "Ativo" ? "default" : "outline"}>{u.status}</Badge></TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingUser(u)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(u)}>
                          {u.status === "Ativo" ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <UserForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <UserForm open={!!editingUser} onOpenChange={open => { if (!open) setEditingUser(null); }} onSubmit={handleEdit} initial={editingUser} />
    </div>
  );
}
