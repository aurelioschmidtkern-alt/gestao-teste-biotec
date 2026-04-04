import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveUsers } from "@/hooks/useActiveUsers";
import type { Projeto } from "@/hooks/useProjects";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; descricao: string; status: string; responsavel: string }) => void;
  initial?: Projeto | null;
}

export function ProjectForm({ open, onOpenChange, onSubmit, initial }: ProjectFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descricao, setDescricao] = useState((initial as any)?.descricao ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Ativo");
  const [responsavel, setResponsavel] = useState(initial?.responsavel ?? "");
  const { data: users = [] } = useActiveUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSubmit({ nome: nome.trim(), descricao: descricao.trim(), status, responsavel });
    if (!initial) { setNome(""); setDescricao(""); setResponsavel(""); setStatus("Ativo"); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="responsavel">Responsável</Label>
            <Select value={responsavel || "__none__"} onValueChange={v => setResponsavel(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Sem responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem responsável</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.user_id} value={u.nome}>{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">{initial ? "Salvar" : "Criar Projeto"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
