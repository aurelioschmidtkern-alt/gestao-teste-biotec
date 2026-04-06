import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Custo } from "@/hooks/useCosts";

const DEFAULT_CATEGORIES = ["Software", "Mão de obra", "Marketing", "Outros"];
const NEW_CATEGORY_VALUE = "__nova__";

interface CostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { tipo_custo: string; categoria: string; valor: number; data: string; descricao?: string }) => void;
  initial?: Custo | null;
  existingCategories?: string[];
}

export function CostForm({ open, onOpenChange, onSubmit, initial, existingCategories = [] }: CostFormProps) {
  const [tipoCusto, setTipoCusto] = useState(initial?.tipo_custo ?? "Fixo");
  const [categoria, setCategoria] = useState(initial?.categoria ?? "Software");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [valor, setValor] = useState(initial ? String(initial.valor) : "");
  const [data, setData] = useState(initial?.data ?? "");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  useEffect(() => {
    setTipoCusto(initial?.tipo_custo ?? "Fixo");
    const cat = initial?.categoria ?? "Software";
    setCategoria(cat);
    setIsNewCategory(false);
    setNewCategoryName("");
    setValor(initial ? String(initial.valor) : "");
    setData(initial?.data ?? "");
    setDescricao(initial?.descricao ?? "");
  }, [initial]);

  const handleCategoryChange = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setIsNewCategory(true);
      setNewCategoryName("");
    } else {
      setIsNewCategory(false);
      setCategoria(value);
    }
  };

  const finalCategory = isNewCategory ? newCategoryName.trim() : categoria;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor);
    if (!v || v <= 0 || !data || !finalCategory) return;
    onSubmit({ tipo_custo: tipoCusto, categoria: finalCategory, valor: v, data, descricao: descricao.trim() || undefined });
    if (!initial) { setValor(""); setData(""); setDescricao(""); setIsNewCategory(false); setNewCategoryName(""); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Custo" : "Novo Custo"}</DialogTitle>
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
            {isNewCategory ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da nova categoria"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  autoFocus
                  required
                />
                <Button type="button" variant="outline" size="sm" onClick={() => { setIsNewCategory(false); setCategoria(allCategories[0] || "Software"); }}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select value={categoria} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY_VALUE}>+ Nova categoria...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label>Valor (R$) *</Label>
            <Input type="number" step="0.01" min="0.01" value={valor} onChange={e => setValor(e.target.value)} required />
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">{initial ? "Salvar" : "Adicionar Custo"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
