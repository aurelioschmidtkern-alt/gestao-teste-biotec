import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, DollarSign, Hash } from "lucide-react";
import { CostForm } from "./CostForm";
import { useCosts, useCreateCost, useUpdateCost, useDeleteCost, formatCurrency, type Custo } from "@/hooks/useCosts";
import { toast } from "sonner";

export function CostsList({ projetoId }: { projetoId: string }) {
  const { data: costs = [], isLoading } = useCosts(projetoId);
  const createCost = useCreateCost();
  const updateCost = useUpdateCost();
  const deleteCost = useDeleteCost();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Custo | null>(null);

  const total = costs.reduce((sum, c) => sum + Number(c.valor), 0);

  const handleCreate = (data: { tipo_custo: string; categoria: string; valor: number; data: string }) => {
    createCost.mutate({ ...data, projeto_id: projetoId }, {
      onSuccess: () => toast.success("Custo adicionado!"),
    });
  };

  const handleEdit = (data: { tipo_custo: string; categoria: string; valor: number; data: string }) => {
    if (!editingCost) return;
    updateCost.mutate({ id: editingCost.id, projeto_id: projetoId, ...data }, {
      onSuccess: () => { toast.success("Custo atualizado!"); setEditingCost(null); },
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando custos...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Custos</p>
              <p className="text-lg font-bold">{formatCurrency(total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><Hash className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Registros</p>
              <p className="text-lg font-bold">{costs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Custos</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum custo registrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map(c => (
                  <TableRow key={c.id}>
                    <TableCell><Badge variant={c.tipo_custo === "Fixo" ? "default" : "secondary"}>{c.tipo_custo}</Badge></TableCell>
                    <TableCell>{c.categoria}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(c.valor))}</TableCell>
                    <TableCell>{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCost(c)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCost.mutate({ id: c.id, projeto_id: projetoId }, { onSuccess: () => toast.success("Custo excluído") })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CostForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <CostForm open={!!editingCost} onOpenChange={open => { if (!open) setEditingCost(null); }} onSubmit={handleEdit} initial={editingCost} />
    </div>
  );
}
