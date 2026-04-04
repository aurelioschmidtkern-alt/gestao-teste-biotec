

## Formatar Datas para dd/mm/aaaa (PT-BR)

### Resumo
Criar uma função utilitária `formatDateBR` e aplicá-la em todos os locais onde datas são exibidas no sistema. As datas são armazenadas como `YYYY-MM-DD` no banco — a formatação é apenas visual.

### Alterações

**1. `src/lib/utils.ts` — adicionar função utilitária**
```typescript
export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
```

**2. `src/pages/MyWork.tsx`**
- Linha 219: `{task.data_inicio}` → `{formatDateBR(task.data_inicio)}`

**3. `src/components/KanbanBoard.tsx`**
- Linha 167: `{task.data_inicio}{task.data_fim ? ` → ${task.data_fim}` : ""}` → `{formatDateBR(task.data_inicio)}{task.data_fim ? ` → ${formatDateBR(task.data_fim)}` : ""}`

**4. `src/components/CostsList.tsx`**
- Linhas 96 e 130: já usam `toLocaleDateString("pt-BR")` — esses já estão corretos, mas serão padronizados para usar `formatDateBR` por consistência.

### O que NÃO muda
- Formato de armazenamento no banco (continua YYYY-MM-DD)
- Inputs de data nos formulários (HTML `type="date"` usa o formato do navegador)
- Lógica de agrupamento e urgência (operam sobre strings ISO)

