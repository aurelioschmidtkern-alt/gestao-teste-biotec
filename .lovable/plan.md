

## Excluir Usuário — Plano

### Resumo
Adicionar funcionalidade de exclusão de usuário com confirmação, acessível apenas para Administradores.

### Alterações

**1. Edge Function `supabase/functions/manage-users/index.ts`**
- Adicionar handler para `action === "delete"`:
  - Recebe `user_id`
  - Deleta o perfil da tabela `profiles` (cascade vai limpar)
  - Deleta o usuário via `adminClient.auth.admin.deleteUser(user_id)`
  - Impedir exclusão do próprio admin (não pode deletar a si mesmo)

**2. Hook `src/hooks/useUsers.ts`**
- Adicionar `useDeleteUser()` mutation que chama `invokeManageUsers("delete", { user_id })`

**3. Página `src/pages/Users.tsx`**
- Adicionar botão de lixeira (Trash2 icon) ao lado dos botões de editar/ativar-desativar
- Adicionar dialog de confirmação (AlertDialog) antes de excluir
- Chamar `deleteUser.mutate()` ao confirmar

### Segurança
- A edge function já valida que o caller é Administrador
- Adicionar validação para impedir auto-exclusão

