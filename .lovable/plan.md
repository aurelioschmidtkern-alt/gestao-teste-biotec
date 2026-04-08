

## Otimização de Invalidação e Fluxo de Mutations

### Alterações

**1. `src/hooks/useTasks.ts` — `checkAndUpdateProjectStatus` condicional**

Recebe `oldStatus` e `newStatus` opcionais. Só executa queries ao banco quando a mudança envolve "Concluído". Retorna `boolean`.

```typescript
async function checkAndUpdateProjectStatus(
  projetoId: string, 
  oldStatus?: string, 
  newStatus?: string
): Promise<boolean> {
  // Se ambos informados e nenhum é "Concluído", skip
  if (oldStatus && newStatus && oldStatus !== "Concluído" && newStatus !== "Concluído") {
    return false;
  }
  
  const { data: tasks } = await supabase
    .from("tarefas").select("status")
    .eq("projeto_id", projetoId).eq("deleted", false);

  if (!tasks || tasks.length === 0) return false;

  const allDone = tasks.every(t => t.status === "Concluído");
  const newProjectStatus = allDone ? "Concluído" : "Ativo";

  const { data: project } = await supabase
    .from("projetos").select("status")
    .eq("id", projetoId).single();

  if (project && project.status !== newProjectStatus) {
    await supabase.from("projetos").update({ status: newProjectStatus }).eq("id", projetoId);
    return true;
  }
  return false;
}
```

**2. `src/hooks/useTasks.ts` — Mutations com invalidação condicional + dashboard**

- `useUpdateTask`: passa `vars.status` como `newStatus`. Não temos `oldStatus` facilmente, mas quando `status` não está nos updates (edição de outros campos), skip o check. Invalidar `["projetos"]` só se `checkAndUpdate` retornar `true`. Sempre invalidar `["dashboard"]`.
- `useCreateTask`: adicionar `invalidateQueries(["dashboard"])`
- `useDeleteTask`: sempre rodar check (tarefa removida pode afetar status). Invalidar `["projetos"]` condicional. Adicionar `["dashboard"]`.
- `useRestoreTask`: idem ao delete. Adicionar `["dashboard"]`.
- `usePermanentlyDeleteTask`: adicionar `["dashboard"]`.

**3. `src/hooks/useCosts.ts` — Invalidar dashboard + colunas específicas**

- Substituir `select("*")` por `select("id, tipo_custo, categoria, valor, data, descricao, projeto_id, created_at")`
- Adicionar `staleTime: 60 * 1000` no `useCosts`
- Adicionar `qc.invalidateQueries({ queryKey: ["dashboard"] })` nas 3 mutations

**4. `src/hooks/useProjects.ts` — Invalidar dashboard nas mutations**

- Adicionar `qc.invalidateQueries({ queryKey: ["dashboard"] })` em: `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useRestoreProject`, `usePermanentlyDeleteProject`

### Impacto esperado

| Cenário | Antes | Depois |
|---|---|---|
| Mover "A Fazer" → "Em Andamento" | 6-7 queries | 3 queries |
| Mover → "Concluído" | 6-7 queries | 5-6 queries |
| Editar campos sem mudar status | 6-7 queries | 3 queries |
| Dashboard após qualquer mutation | Desatualizada | Sincronizada |

### O que NÃO muda
- Visual do Kanban ou Dashboard
- Lógica de negócio
- Estrutura do banco

