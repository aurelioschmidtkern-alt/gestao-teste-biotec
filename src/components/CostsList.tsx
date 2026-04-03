import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const existingCategories = Array.from(new Set(costs.map(c => c.categoria)));

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
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Total de Custos</p>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Registros</p>
              <p className="text-xl font-bold">{costs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Custos</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum custo registrado</p>
          ) : (
            <div className="divide-y divide-border/50">
              {/* Header */}
              <div className="grid grid-cols-[100px_1fr_120px_100px_80px] gap-4 pb-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                <span>Tipo</span>
                <span>Categoria</span>
                <span>Valor</span>
                <span>Data</span>
                <span></span>
              </div>
              {/* Rows */}
              {costs.map(c => (
                <div
                  key={c.id}
                  className="grid grid-cols-[100px_1fr_120px_100px_80px] gap-4 py-3.5 items-center hover:bg-muted/30 transition-colors rounded-lg -mx-2 px-2"
                >
                  <span>
                    <Badge className={`rounded-full text-xs ${c.tipo_custo === "Fixo" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.tipo_custo}
                    </Badge>
                  </span>
                  <span className="text-sm">{c.categoria}</span>
                  <span className="text-sm font-semibold">{formatCurrency(Number(c.valor))}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  <div className="flex gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingCost(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteCost.mutate({ id: c.id, projeto_id: projetoId }, { onSuccess: () => toast.success("Custo excluído") })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CostForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} existingCategories={existingCategories} />
      <CostForm open={!!editingCost} onOpenChange={open => { if (!open) setEditingCost(null); }} onSubmit={handleEdit} initial={editingCost} existingCategories={existingCategories} />
    </div>
  );
}
