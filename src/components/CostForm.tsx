import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { tipo_custo: string; categoria: string; valor: number; data: string }) => void;
}

export function CostForm({ open, onOpenChange, onSubmit }: CostFormProps) {
  const [tipoCusto, setTipoCusto] = useState("Fixo");
  const [categoria, setCategoria] = useState("Software");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor);
    if (!v || v <= 0 || !data) return;
    onSubmit({ tipo_custo: tipoCusto, categoria, valor: v, data });
    setValor(""); setData("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Custo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Custo</Label>
            <Select value={tipoCusto} onValueChange={setTipoCusto}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixo">Fixo</SelectItem>
                <SelectItem value="Variável">Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Mão de obra">Mão de obra</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" min="0.01" value={valor} onChange={e => setValor(e.target.value)} required />
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Adicionar Custo</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
