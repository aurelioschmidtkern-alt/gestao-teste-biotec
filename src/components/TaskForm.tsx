import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Tarefa } from "@/hooks/useTasks";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; descricao: string; responsavel: string; data_inicio: string; data_fim: string; status: string }) => void;
  initial?: Tarefa | null;
  defaultStatus?: string;
}

export function TaskForm({ open, onOpenChange, onSubmit, initial, defaultStatus = "A Fazer" }: TaskFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [responsavel, setResponsavel] = useState(initial?.responsavel ?? "");
  const [dataInicio, setDataInicio] = useState(initial?.data_inicio ?? "");
  const [dataFim, setDataFim] = useState(initial?.data_fim ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    if (dataInicio && dataFim && dataFim < dataInicio) {
      toast.error("Data fim não pode ser anterior à data início");
      return;
    }
    onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim(),
      responsavel: responsavel.trim(),
      data_inicio: dataInicio || "",
      data_fim: dataFim || "",
      status: initial?.status ?? defaultStatus,
    });
    if (!initial) { setNome(""); setDescricao(""); setResponsavel(""); setDataInicio(""); setDataFim(""); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
          <div>
            <Label>Responsável</Label>
            <Input value={responsavel} onChange={e => setResponsavel(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full">{initial ? "Salvar" : "Criar Tarefa"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
