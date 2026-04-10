

## Etapa 0.1 — Auditoria Básica (com ajustes aprovados)

### 1. Criar tabela `audit_logs` (migration)

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid null references profiles(id) on delete set null,
  workspace_id uuid null,
  action text not null,
  entity text not null,
  entity_id uuid not null,
  entity_name text null,
  description text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert to authenticated
  with check (true);

create policy "Admins and coordinators can view audit logs"
  on public.audit_logs for select to authenticated
  using (is_admin(auth.uid()) or is_coordinator(auth.uid()));
```

### 2. Criar helper `src/lib/auditLog.ts`

Ajustes conforme solicitado:

- `profileId` aceito como parametro opcional
- Fallback para busca no `profiles` somente se nao fornecido
- Actions padronizadas via tipo literal
- Entity padronizada via tipo literal

```typescript
import { supabase } from "@/integrations/supabase/client";

// Padronização oficial de actions
type AuditAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "restore" 
  | "permanent_delete" 
  | "status_change";

// Padronização oficial de entities
// "usuario" cobre tanto perfil quanto conta de usuario
type AuditEntity = "tarefa" | "projeto" | "custo" | "usuario";

interface AuditEntry {
  action: AuditAction;
  entity: AuditEntity;
  entity_id: string;
  entity_name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  profileId?: string;  // opcional — evita query extra quando disponível
}

export async function logAudit(entry: AuditEntry) {
  try {
    let pid = entry.profileId ?? null;

    if (!pid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles").select("id").eq("user_id", user.id).single();
      pid = profile?.id ?? null;
    }

    await supabase.from("audit_logs").insert({
      profile_id: pid,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      entity_name: entry.entity_name ?? null,
      description: entry.description ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // silencioso
  }
}
```

### 3. Convenção de `entity` (ajuste solicitado)

| Entidade | Valor `entity` | Quando usar |
|---|---|---|
| Tarefa | `tarefa` | CRUD de tarefas, movimentacao Kanban |
| Projeto | `projeto` | CRUD de projetos |
| Custo | `custo` | CRUD de custos |
| Usuario/Perfil | `usuario` | Criar/editar/deletar usuario E editar perfil proprio |

**Regra**: `useUpdateProfile` tambem usa `entity: "usuario"`. Nao existira `entity: "profile"` separado.

### 4. Integrar nos hooks

Todos os hooks ja tem acesso a `profile` via `useProfile()` nos componentes que os chamam. Porem, os hooks de mutation nao tem `profileId` internamente. A estrategia:

- Nos hooks onde `profile` nao esta disponivel diretamente (mutations puras), chamar `logAudit` **sem** `profileId` (fallback automatico)
- No `useUpdateProfile`, que ja tem acesso a `profile`, passar `profileId` diretamente

**Mutations a instrumentar (fire-and-forget, sem await):**

| Hook | action | entity | profileId |
|---|---|---|---|
| `useCreateTask` | `create` | `tarefa` | fallback |
| `useUpdateTask` | `update` / `status_change` | `tarefa` | fallback |
| `useDeleteTask` | `delete` | `tarefa` | fallback |
| `useRestoreTask` | `restore` | `tarefa` | fallback |
| `usePermanentlyDeleteTask` | `permanent_delete` | `tarefa` | fallback |
| `useCreateProject` | `create` | `projeto` | fallback |
| `useUpdateProject` | `update` | `projeto` | fallback |
| `useDeleteProject` | `delete` | `projeto` | fallback |
| `useRestoreProject` | `restore` | `projeto` | fallback |
| `usePermanentlyDeleteProject` | `permanent_delete` | `projeto` | fallback |
| `useCreateCost` | `create` | `custo` | fallback |
| `useUpdateCost` | `update` | `custo` | fallback |
| `useDeleteCost` | `delete` | `custo` | fallback |
| `useCreateUser` | `create` | `usuario` | fallback |
| `useUpdateUser` | `update` | `usuario` | fallback |
| `useDeleteUser` | `delete` | `usuario` | fallback |
| `useUpdateProfile` | `update` | `usuario` | direto |

**Nota sobre profileId nos hooks de mutation**: Os hooks usam `useMutation` sem acesso direto ao `profile`. Para evitar refatorar todos os hooks adicionando `useProfile()`, as mutations usarao o fallback. O custo e 1 query extra por mutation (apenas `getUser` + `select profiles.id`), que e aceitavel dado que mutations sao eventos raros. O `useUpdateProfile` ja tem `profile` disponivel e passara direto.

### 5. Arquivos alterados

| Arquivo | Tipo |
|---|---|
| Migration SQL | Criacao |
| `src/lib/auditLog.ts` | Novo |
| `src/hooks/useTasks.ts` | Modificacao |
| `src/hooks/useProjects.ts` | Modificacao |
| `src/hooks/useCosts.ts` | Modificacao |
| `src/hooks/useUsers.ts` | Modificacao |
| `src/hooks/useProfile.ts` | Modificacao |

### O que NAO muda
- Performance das mutations (log e fire-and-forget)
- Visual do sistema
- Fluxo de cache/invalidacao
- Nenhuma tela de visualizacao de logs nesta etapa

