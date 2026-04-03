

## Sistema de Permissões (RBAC) — Plano

### Resumo
Implementar controle de acesso por perfil (Administrador, Coordenador, Funcionario) em todo o sistema. Migração de "Usuário" para "Funcionario" no banco. Restrições no front-end e validação no edge function.

### Database

**Migração SQL**:
1. Atualizar perfis existentes: `UPDATE profiles SET perfil = 'Funcionario' WHERE perfil = 'Usuário'`
2. Alterar default da coluna: `ALTER TABLE profiles ALTER COLUMN perfil SET DEFAULT 'Funcionario'`

### Novo: `src/hooks/usePermissions.ts`
Hook centralizado que retorna permissões baseadas no perfil:
- `canCreateProject`, `canEditProject`, `canDeleteProject`
- `canManageUsers`
- `canAccessCosts`
- `canViewAllProjects`
- `perfil` (string)

Regras:
- **Administrador**: tudo habilitado
- **Coordenador**: tudo exceto `canManageUsers`
- **Funcionario**: apenas `canViewAllProjects = false`, `canAccessCosts = false`, `canManageUsers = false`, `canCreateProject = false`, `canEditProject = false`, `canDeleteProject = false`

### Editar: `src/components/UserForm.tsx`
- Trocar opções do Select de perfil para: "Administrador", "Coordenador", "Funcionario"
- Default: "Funcionario"

### Editar: `src/components/AppSidebar.tsx`
- Mostrar "Usuários" apenas para Administrador (já implementado)
- Usar `usePermissions` em vez de checar `perfil` diretamente

### Editar: `src/pages/Index.tsx` (Projetos)
- Importar `usePermissions`
- Funcionario: filtrar projetos (apenas onde `responsavel === userName` ou tem tarefas vinculadas)
- Ocultar botão "Novo Projeto" se `!canCreateProject`
- Ocultar botão de excluir se `!canDeleteProject`

### Editar: `src/pages/ProjectDetail.tsx`
- Ocultar botão "Editar" se `!canEditProject`
- Ocultar aba "Custos" se `!canAccessCosts`

### Editar: `src/hooks/useProjects.ts`
- Adicionar hook `useFilteredProjects` que filtra por perfil (Funcionario vê apenas projetos vinculados)
- Ou aplicar filtro no `Index.tsx` usando dados do perfil

### Editar: `src/hooks/useDashboard.ts`
- Atualizar condição de filtro: trocar `isAdmin` por `canViewAllProjects` (Admin e Coordenador veem tudo, Funcionario filtra)

### Editar: `src/pages/Dashboard.tsx`
- Ocultar botão "Novo Projeto" se `!canCreateProject`

### Editar: `supabase/functions/manage-users/index.ts`
- Manter validação existente (já restringe a Administrador)

### Editar: `src/components/KanbanBoard.tsx`
- Funcionario: permitir criar/mover tarefas nos projetos vinculados (sem restrição adicional por ora)

### O que NÃO muda
- Estrutura das tabelas (apenas update de dados e default)
- Tela "Meu Trabalho" (já filtra por usuário)
- RLS policies (permanecem como estão)
- Login/registro

