

## Etapa 5 — Reaproveitamento de Cache entre Telas

### QueryKey do `useDashboard`

Conforme solicitado, a queryKey será:

```typescript
["dashboard", user?.id, profile?.perfil, projectId ?? "all"]
```

Isso garante cache por usuário e por perfil, sem usar `profile?.nome` (instável).

### Alterações

**1. `src/hooks/useDashboard.ts`**
- Importar `useAuth` para obter `user?.id`
- QueryKey: `["dashboard", user?.id, profile?.perfil, projectId ?? "all"]`
- Adicionar `refetchOnMount: false`

**2. `src/hooks/useMyTasks.ts`**
- Simplificar queryKey de `["my-tasks", user?.id, userName]` para `["my-tasks", user?.id]`
- Adicionar `refetchOnMount: false`

**3. Adicionar `refetchOnMount: false` nos hooks restantes:**
- `useProjects` e `useDeletedProjects` (`src/hooks/useProjects.ts`)
- `useTasks` e `useDeletedTasks` (`src/hooks/useTasks.ts`)
- `useCosts` (`src/hooks/useCosts.ts`)
- `useUsers` (`src/hooks/useUsers.ts`)
- `useProfile` (`src/hooks/useProfile.ts`)

### Impacto esperado

| Cenário | Antes | Depois |
|---|---|---|
| Navegar Dashboard → Projetos → Dashboard (< 2min) | Refetch ao montar | 0 queries (cache reusado) |
| Navegar entre telas dentro do staleTime | Refetch em background | 0 queries |
| Profile ao navegar | Refetch a cada mount | 0 queries (cache 5min) |
| QueryKey instável com `nome` | Cache fragmentado | Cache unificado por `user.id + perfil` |

### O que NÃO muda
- Dados continuam atualizando após mutations (invalidateQueries)
- staleTime de cada hook mantido
- Visual e funcionalidade intactos

