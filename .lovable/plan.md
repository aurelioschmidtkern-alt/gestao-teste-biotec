

## Melhorias do Sistema — Plano de Implementação

### 1. Gerenciamento de Usuários

A tabela `profiles` já existe com `user_id`, `nome`, `status`. Precisamos adicionar o campo `perfil` (Administrador/Usuário) via migração.

**Database**: Migração para adicionar coluna `perfil` (text, default 'Usuário') na tabela `profiles`. Adicionar política RLS para que administradores possam ver/editar todos os perfis.

**Novos arquivos**:
- `src/pages/Users.tsx` — Tela de listagem de usuários com tabela (nome, email, perfil, status, data), botões criar/editar/ativar/inativar
- `src/components/UserForm.tsx` — Dialog para criar/editar usuário (nome, email, senha, perfil)
- `src/hooks/useUsers.ts` — Hook com queries para listar perfis e funções de admin (criar usuário via edge function, atualizar perfil)

**Edge function**: `manage-users` — necessária para criar usuários server-side (admin cria conta para outros) usando service role key. Também para atualizar senha de outros usuários.

**Alterações**:
- `src/App.tsx` — Adicionar rota `/usuarios`
- `src/pages/Index.tsx` — Adicionar link "Usuários" na navegação

### 2. Kanban — Card Inteiro Arrastável

Atualmente só o ícone `GripVertical` é o drag handle. A mudança é simples: mover `{...provided.dragHandleProps}` do `<span>` para o `<Card>` principal, tornando toda a área clicável para arrastar.

**Arquivo**: `src/components/KanbanBoard.tsx` — Adicionar `{...provided.dragHandleProps}` ao Card e remover do span do GripVertical. Adicionar `cursor-grab` ao card.

### 3. Edição de Tarefas — Carregar Dados Salvos

O `TaskForm` usa `useState` com valor inicial, mas não atualiza quando `initial` muda (o state só é setado na montagem).

**Arquivo**: `src/components/TaskForm.tsx` — Adicionar `useEffect` que sincroniza os states quando `initial` muda, para que ao abrir edição os campos venham preenchidos.

### 4. Edição de Custos

**Arquivos alterados**:
- `src/hooks/useCosts.ts` — Adicionar hook `useUpdateCost`
- `src/components/CostForm.tsx` — Aceitar prop `initial` para pré-preencher campos; mudar título/botão conforme modo
- `src/components/CostsList.tsx` — Adicionar botão Editar em cada linha, state `editingCost`, e passar dados ao CostForm

### Resumo de Arquivos

| Ação | Arquivo |
|------|---------|
| Migração | Adicionar coluna `perfil` em `profiles` |
| Criar | `src/pages/Users.tsx` |
| Criar | `src/components/UserForm.tsx` |
| Criar | `src/hooks/useUsers.ts` |
| Criar | `supabase/functions/manage-users/index.ts` |
| Editar | `src/App.tsx` (rota `/usuarios`) |
| Editar | `src/pages/Index.tsx` (link Usuários) |
| Editar | `src/components/KanbanBoard.tsx` (drag handle) |
| Editar | `src/components/TaskForm.tsx` (useEffect sync) |
| Editar | `src/hooks/useCosts.ts` (useUpdateCost) |
| Editar | `src/components/CostForm.tsx` (modo edição) |
| Editar | `src/components/CostsList.tsx` (botão editar) |

### O que NÃO muda
- Tela de login/registro
- Estrutura de projetos, tarefas e custos
- Dashboard existente
- Hooks existentes (useProjects, useTasks)

