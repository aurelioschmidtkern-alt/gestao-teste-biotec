

## Validação do `useProjects()` e Otimização do `useDashboard`

### Estado atual do `useProjects()`

| Critério | Status | Detalhe |
|---|---|---|
| Não usa `SELECT *` | ✅ OK | Seleciona `id, nome, status, responsavel, created_at, descricao, deleted, deleted_at` |
| Colunas mínimas para dropdown | ⚠️ Traz excesso | O dropdown só precisa de `id` e `nome`. As colunas `created_at`, `descricao`, `deleted`, `deleted_at` são desnecessárias para esse uso |
| Filtro server-side | ✅ OK | Já filtra `.eq("deleted", false)` no banco |
| Cache | ⚠️ Usa global (60s) | Adequado, mas o hook é usado em várias telas — OK |
| Ordenação | ⚠️ | `.order("created_at", { ascending: false })` — necessário para a listagem de projetos, não para o dropdown |

**Conclusão**: `useProjects()` está parcialmente otimizado. Funciona para o dropdown, mas traz colunas extras. Como ele é usado em outras telas (Index) que precisam de `descricao`, `responsavel`, etc., **não devemos reduzir suas colunas** — isso quebraria a tela de projetos.

### Problema principal: Dashboard ainda chama `useDashboard` DUAS VEZES

A Dashboard (linhas 40-41) continua fazendo:
```typescript
const { data: allData } = useDashboard(null);        // 3 queries
const { data } = useDashboard(selectedProjectId);     // 3 queries (duplicadas quando null)
```

O `allData` só serve para popular o dropdown (linha 83: `allData?.projects`).

### Plano

**1. `src/pages/Dashboard.tsx` — Usar `useProjects()` para o dropdown**

- Importar `useProjects` de `@/hooks/useProjects`
- Substituir `useDashboard(null)` por `const { data: projectsList } = useProjects()`
- Remover a chamada `useDashboard(null)` completamente
- Usar `projectsList` no dropdown (linha 83)
- Manter apenas uma chamada: `useDashboard(selectedProjectId)`
- Ajustar a lógica de loading para depender apenas de `useDashboard`

```typescript
// De (6 queries):
const { data: allData, isLoading: allLoading } = useDashboard(null);
const { data, isLoading } = useDashboard(selectedProjectId);
const displayData = selectedProjectId ? data : allData;

// Para (3 queries + cache do useProjects):
const { data: projectsList } = useProjects();
const { data, isLoading } = useDashboard(selectedProjectId);
```

Dropdown usa `projectsList` em vez de `allData?.projects`.

**2. `src/hooks/useDashboard.ts` — Aplicar filtros server-side e loop único**

- Quando `projectId` existe, filtrar diretamente nas queries:
  ```typescript
  let projectsQuery = supabase.from("projetos").select("id, nome, status, responsavel").eq("deleted", false);
  if (projectId) projectsQuery = projectsQuery.eq("id", projectId);
  
  let tasksQuery = supabase.from("tarefas").select("id, nome, status, data_fim, responsavel, projeto_id, prioridade").eq("deleted", false);
  if (projectId) tasksQuery = tasksQuery.eq("projeto_id", projectId);
  
  let costsQuery = supabase.from("custos").select("categoria, valor, projeto_id");
  if (projectId) costsQuery = costsQuery.eq("projeto_id", projectId);
  ```

- Remover `.order("created_at")` das queries (não usado pela UI da dashboard)

- Substituir as múltiplas iterações `.filter()` por um **loop único** que calcula todas as métricas e `getTaskUrgency` uma só vez por tarefa

- Adicionar `staleTime: 2 * 60 * 1000` e `refetchOnWindowFocus: false` no hook

**3. `useProjects()` — Manter como está**

O hook já está adequado para o uso no dropdown. As colunas extras (`descricao`, `created_at`) são necessárias para a tela Index e o cache de 60s do global é suficiente. Reduzir colunas criaria a necessidade de dois hooks separados sem ganho real — o `useProjects` já é cacheado e compartilhado entre telas.

### Impacto esperado

- **-3 queries por acesso** ao Dashboard (elimina `useDashboard(null)`)
- **Menos registros retornados** quando projeto selecionado (filtro server-side)
- **~3x menos chamadas a `getTaskUrgency`** (loop único)
- **Cache mais estável** para a dashboard (2min + sem refetch ao focar)

### O que NÃO muda
- Formato de retorno do `DashboardData`
- Visual da dashboard
- Hook `useProjects()` (já adequado)
- Estrutura do banco

