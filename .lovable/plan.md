

## Otimização de Consumo — Database Server

### 1. Diagnóstico

| Tela/Componente | Problema | Impacto |
|---|---|---|
| **Dashboard** | Chama `useDashboard` **duas vezes** (linha 40: filtrado, linha 42: `allData` sem filtro). Cada chamada faz 3 queries (`SELECT *` em projetos, tarefas, custos). Total: **6 queries** ao abrir. | **Alto** |
| **Dashboard** | Usa `SELECT *` em todas as tabelas — traz todas as colunas e todos os registros, filtra no cliente. | **Alto** |
| **Index (Projetos)** | `useProjects()` faz `SELECT *` de todos projetos. Além disso, para Funcionários, dispara query extra em `tarefas` para buscar `projeto_id` vinculados. | **Médio** |
| **MyWork** | `useMyTasks` faz `SELECT *` de **todas** as tarefas (com join em projetos), depois filtra no cliente por responsável. Também chama `useProjects()` separadamente. | **Alto** |
| **ProjectDetail** | Faz query individual do projeto (`SELECT *`), razoável. Kanban faz `SELECT *` filtrado por `projeto_id` — ok. | **Baixo** |
| **QueryClient** | Criado sem `defaultOptions` — não tem `staleTime` nem `gcTime`. Cada navegação entre rotas refaz **todas** as queries imediatamente. | **Muito Alto** |
| **useProfile** | Chamado em muitos componentes (usePermissions, useDashboard, Index, MyWork, UserMenu). Sem `staleTime`, refaz a cada mount. | **Médio** |
| **Invalidações em cascata** | `useUpdateTask` invalida `tarefas`, `my-tasks`, `projetos` (via `checkAndUpdateProjectStatus`). Cada mudança de status no Kanban gera 4+ queries. | **Médio** |

**Causa principal do 93% de Database**: Falta de `staleTime` no QueryClient + `SELECT *` sem filtros server-side + Dashboard fazendo 6 queries por load + MyWork buscando todas as tarefas do sistema.

---

### 2. Plano de Otimização

**A. `src/App.tsx` — Configurar `staleTime` global no QueryClient**
- Adicionar `defaultOptions.queries.staleTime: 2 * 60 * 1000` (2 minutos)
- Isso evita refetch ao navegar entre rotas quando os dados ainda são recentes
- Impacto: **redução massiva** — é a mudança mais importante

**B. `src/hooks/useDashboard.ts` — Selecionar apenas colunas necessárias**
- Projetos: `.select("id, nome, status, responsavel")` em vez de `*`
- Tarefas: `.select("id, nome, status, data_fim, responsavel, projeto_id, prioridade")` em vez de `*`
- Custos: `.select("categoria, valor")` em vez de `*`
- Reduz payload transferido significativamente

**C. `src/pages/Dashboard.tsx` — Eliminar a segunda chamada `useDashboard`**
- Linha 42: `const { data: allData } = useDashboard(null)` é redundante — só serve para popular o dropdown de projetos
- Substituir por reutilizar os projetos do `data` quando `selectedProjectId` é null, ou usar `useProjects()` que já é cacheado
- Remove 3 queries desnecessárias

**D. `src/hooks/useMyTasks.ts` — Filtrar no servidor**
- Atualmente traz todas as tarefas e filtra no cliente
- Usar `.contains("responsavel", [userName])` diretamente na query do Supabase (campo é array)
- Adicionar `.neq("status", "Concluído")` para não trazer concluídas (já são filtradas no cliente)
- Selecionar apenas colunas usadas: `id, nome, descricao, status, data_inicio, data_fim, responsavel, prioridade, projeto_id, created_at, projetos(nome)`

**E. `src/hooks/useProjects.ts` — Selecionar colunas necessárias**
- `.select("id, nome, status, responsavel, created_at, descricao")` em vez de `*`

**F. `src/hooks/useProfile.ts` — Adicionar staleTime específico**
- O perfil raramente muda: `staleTime: 5 * 60 * 1000` (5 minutos)

**G. `src/hooks/useActiveUsers.ts` — Adicionar staleTime**
- Lista de usuários ativos raramente muda: `staleTime: 5 * 60 * 1000`

**H. `src/hooks/useTasks.ts` — Otimizar `checkAndUpdateProjectStatus`**
- Selecionar apenas `status`: `.select("status")` (já faz isso — ok)
- Mas a função faz 2 queries extras em cada update de tarefa — considerar mover para trigger no banco no futuro. Por agora, manter mas garantir que as invalidações não cascateiam desnecessariamente.

---

### 3. Resultado Esperado

| Melhoria | Redução estimada |
|---|---|
| `staleTime` global de 2min | ~50-60% das queries (elimina refetch ao navegar) |
| Eliminar `useDashboard` duplicado | ~3 queries por acesso ao Dashboard |
| Filtrar MyTasks no servidor | Reduz payload e processamento no banco |
| Selecionar colunas específicas | Reduz I/O de rede e carga no banco |
| `staleTime` em profile/users | Elimina queries repetidas de dados estáveis |

**Impacto total estimado**: redução de 60-70% no consumo de Database Server.

### O que NÃO muda
- Estrutura das tabelas
- RLS/permissões
- Funcionalidade visual do sistema
- Lógica de negócio

