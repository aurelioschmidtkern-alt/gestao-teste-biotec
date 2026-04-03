import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useActiveUsers } from "@/hooks/useActiveUsers";
import type { Tarefa } from "@/hooks/useTasks";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; descricao: string; responsaveis: string[]; data_inicio: string; data_fim: string; status: string }) => void;
  initial?: Tarefa | null;
  defaultStatus?: string;
}

export function TaskForm({ open, onOpenChange, onSubmit, initial, defaultStatus = "A Fazer" }: TaskFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");
  const [responsaveis, setResponsaveis] = useState<string[]>((initial?.responsavel as string[] | null) ?? []);
  const [dataInicio, setDataInicio] = useState(initial?.data_inicio ?? "");
  const [dataFim, setDataFim] = useState(initial?.data_fim ?? "");
  const { data: users = [] } = useActiveUsers();

  useEffect(() => {
    setNome(initial?.nome ?? "");
    setDescricao(initial?.descricao ?? "");
    setResponsaveis((initial?.responsavel as string[] | null) ?? []);
    setDataInicio(initial?.data_inicio ?? "");
    setDataFim(initial?.data_fim ?? "");
  }, [initial]);

  const toggleUser = (nome: string) => {
    setResponsaveis(prev =>
      prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]
    );
  };

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
      responsaveis,
      data_inicio: dataInicio || "",
      data_fim: dataFim || "",
      status: initial?.status ?? defaultStatus,
    });
    if (!initial) { setNome(""); setDescricao(""); setResponsaveis([]); setDataInicio(""); setDataFim(""); }
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
            <Label>Responsáveis</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {responsaveis.length > 0
                    ? <div className="flex flex-wrap gap-1">{responsaveis.map(r => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {r}
                          <button type="button" className="ml-1" onClick={e => { e.stopPropagation(); toggleUser(r); }}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}</div>
                    : <span className="text-muted-foreground">Selecionar responsáveis</span>
                  }
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {users.map(u => (
                    <label key={u.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                      <Checkbox checked={responsaveis.includes(u.nome)} onCheckedChange={() => toggleUser(u.nome)} />
                      {u.nome}
                    </label>
                  ))}
                  {users.length === 0 && <div className="text-sm text-muted-foreground p-2">Nenhum usuário ativo</div>}
                </div>
              </PopoverContent>
            </Popover>
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
