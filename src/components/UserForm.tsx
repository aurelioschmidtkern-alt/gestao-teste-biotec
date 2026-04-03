import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/hooks/useUsers";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; email: string; password: string; perfil: string }) => void;
  initial?: UserProfile | null;
}

export function UserForm({ open, onOpenChange, onSubmit, initial }: UserFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState("Funcionario");

  useEffect(() => {
    setNome(initial?.nome ?? "");
    setEmail(initial?.email ?? "");
    setPassword("");
    setPerfil(initial?.perfil ?? "Funcionario");
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || (!initial && (!email.trim() || !password.trim()))) return;
    onSubmit({ nome: nome.trim(), email: email.trim(), password, perfil });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!initial} />
          </div>
          <div>
            <Label>{initial ? "Nova Senha (deixe em branco para manter)" : "Senha *"}</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!initial} />
          </div>
          <div>
            <Label>Perfil</Label>
            <Select value={perfil} onValueChange={setPerfil}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Usuário">Usuário</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">{initial ? "Salvar" : "Criar Usuário"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
