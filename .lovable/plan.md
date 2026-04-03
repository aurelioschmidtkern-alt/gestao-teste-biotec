

## Tela de Login com Registro — Plano de Implementação

### Resumo
Adicionar autenticação ao sistema com uma tela de login/registro usando Lovable Cloud Auth (Supabase Auth). Criar uma tabela `profiles` para armazenar o nome do usuário. Proteger as rotas existentes sem alterar nenhuma funcionalidade atual.

### Database

**Nova tabela: `profiles`**
- `id` (uuid, PK, FK → auth.users ON DELETE CASCADE)
- `nome` (text, NOT NULL)
- `status` (text, default 'Ativo')
- `created_at` (timestamptz, default now())

**RLS**: Usuários autenticados podem ler/atualizar apenas seu próprio perfil.

**Trigger**: Auto-criar perfil ao registrar (usando `raw_user_meta_data->>'nome'`).

**Tabelas existentes** (projetos, tarefas, custos): As políticas RLS públicas serão mantidas sem alteração, conforme solicitado.

### Novos Arquivos

1. **`src/pages/Auth.tsx`** — Tela de login/registro
   - Layout centralizado com card
   - Cabeçalho: ícone + "Sistema de Gestão" + subtítulo
   - Alternador de abas: "Entrar" / "Criar conta"
   - Modo Entrar: campos email e senha + botão "Entrar"
   - Modo Criar conta: campos nome, email e senha + botão "Criar conta"
   - Validações client-side (campos obrigatórios, email válido)
   - Feedback de erro/sucesso via toast

2. **`src/hooks/useAuth.ts`** — Hook de autenticação
   - `useSession()` — estado da sessão com `onAuthStateChange`
   - Funções: `signIn`, `signUp` (com nome no metadata), `signOut`

3. **`src/components/ProtectedRoute.tsx`** — Wrapper que redireciona para `/auth` se não autenticado

### Alterações em Arquivos Existentes

- **`src/App.tsx`** — Adicionar rota `/auth` e envolver rotas existentes com `ProtectedRoute`
- **`src/pages/Index.tsx`** — Adicionar botão de logout no header

### Fluxo
```text
Usuário não autenticado → /auth (login/registro)
Registro → signUp com metadata {nome} → trigger cria perfil → auto-login → redirect /
Login → signIn → redirect /
Logout → signOut → redirect /auth
```

### O que NÃO muda
- Páginas de projeto, Kanban, custos — zero alterações
- Estrutura de dados existente (projetos, tarefas, custos)
- Hooks existentes (useProjects, useTasks, useCosts)
- Regras de negócio e validações

