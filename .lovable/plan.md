

## Exibir Usuário Logado no Topo — Plano

### Resumo
Criar um componente global de header com avatar, nome do usuário logado e menu dropdown (Meu Perfil, Sair). Adicionar campo `foto_url` na tabela `profiles`. Criar modal de edição de perfil (nome, foto). Aplicar em todas as telas internas.

### Database

**Migração**: Adicionar coluna `foto_url` (text, nullable) na tabela `profiles`.

**Storage**: Criar bucket `avatars` (público) com política RLS para upload apenas pelo próprio usuário.

### Mudanças

**Novo: `src/components/UserMenu.tsx`**
- Componente que busca o perfil do usuário logado (query na tabela `profiles` por `auth.uid()`)
- Avatar circular: exibe foto se `foto_url` existir, senão inicial do nome
- Nome do usuário ao lado (oculto em mobile)
- Dropdown com: "Meu Perfil" (abre modal de edição), "Sair" (chama `signOut`)
- Usa `Avatar`, `AvatarImage`, `AvatarFallback`, `DropdownMenu`

**Novo: `src/components/ProfileEditDialog.tsx`**
- Modal com campos: nome, foto (upload de imagem)
- Upload de foto vai para bucket `avatars` via Supabase Storage
- Ao salvar, atualiza `profiles.nome` e `profiles.foto_url`
- Invalida queries para refletir mudanças imediatas

**Novo: `src/hooks/useProfile.ts`**
- Hook que busca o perfil do usuário logado (`profiles` where `user_id = auth.uid()`)
- Mutation para atualizar nome e foto_url

**Editar: `src/pages/Index.tsx`**
- Substituir o botão de logout pelo componente `UserMenu`
- Mover `UserMenu` para o header, canto direito

**Editar: `src/pages/MyWork.tsx`, `src/pages/ProjectDetail.tsx`, `src/pages/Users.tsx`**
- Adicionar `UserMenu` no header de cada página (canto superior direito)

### O que NÃO muda
- Tela de login/registro
- Projetos, tarefas, custos, Kanban
- Gerenciamento de usuários (tela admin)
- RLS policies existentes

