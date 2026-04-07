

## Lixeira — Soft Delete e Recuperação de Projetos e Tarefas

### Resumo
Implementar exclusão temporária (soft delete) para projetos e tarefas, com uma tela de Lixeira para restaurar ou excluir permanentemente.

---

### 1. Migration — adicionar campos de soft delete

```sql
ALTER TABLE public.projetos
  ADD COLUMN deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamptz;

ALTER TABLE public.tarefas
  ADD COLUMN deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamptz;
```

### 2. Hooks — funções de soft delete, restore e permanent delete

**`src/hooks/useProjects.ts`**
- Alterar `useProjects()` para filtrar `deleted = false` (`.eq("deleted", false)`)
- Adicionar `useDeletedProjects()` — busca projetos com `deleted = true`
- Alterar `useDeleteProject()` para fazer soft delete (update `deleted=true, deleted_at=now()`)
- Adicionar `useRestoreProject()`— update `deleted=false, deleted_at=null`
- Adicionar `usePermanentlyDeleteProject()` — delete real

**`src/hooks/useTasks.ts`**
- Alterar `useTasks()` para filtrar `deleted = false`
- Adicionar `useDeletedTasks()` — busca tarefas com `deleted = true`
- Alterar `useDeleteTask()` para fazer soft delete
- Adicionar `useRestoreTask()` e `usePermanentlyDeleteTask()`

### 3. Página de Lixeira — `src/pages/Trash.tsx`

Duas seções em abas:
- **Projetos excluídos**: nome, data de exclusão, botões Restaurar e Excluir permanentemente
- **Tarefas excluídas**: nome, projeto associado, data de exclusão, botões Restaurar e Excluir permanentemente

Cada ação destrutiva (excluir permanentemente) terá `AlertDialog` de confirmação.

### 4. Rota e Sidebar

**`src/App.tsx`** — adicionar rota `/lixeira`

**`src/components/AppSidebar.tsx`** — adicionar item "Lixeira" com ícone `Trash2`, visível para Administradores e Coordenadores

### 5. Atualizar modais de exclusão existentes

**`src/pages/Index.tsx`** e **`src/pages/ProjectDetail.tsx`** (tarefas):
- Atualizar texto do modal de confirmação para informar que o item vai para a lixeira e poderá ser restaurado

### 6. Permissões

- Adicionar `canAccessTrash` ao `usePermissions` (Administrador e Coordenador)
- Somente quem pode excluir pode restaurar/excluir permanentemente

### O que NÃO muda
- RLS existente (já permite todas as operações nas tabelas projetos/tarefas)
- Estrutura visual das outras páginas
- Lógica do Kanban, Meu Trabalho, Dashboard (apenas filtram `deleted = false`)

