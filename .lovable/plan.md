

## Migrar para Lovable Cloud — Banco de Dados

### Objetivo
Substituir o armazenamento em localStorage por tabelas no banco de dados do Lovable Cloud para projetos, tarefas e custos.

### Tabelas

**projetos**
- `id` (uuid, PK, auto)
- `nome` (text, NOT NULL)
- `status` (text, default 'Ativo') — valores: Ativo, Pausado, Concluído
- `responsavel` (text)
- `created_at` (timestamptz, auto)

**tarefas**
- `id` (uuid, PK, auto)
- `projeto_id` (uuid, FK → projetos, ON DELETE CASCADE)
- `nome` (text, NOT NULL)
- `descricao` (text)
- `responsavel` (text)
- `data_inicio` (date)
- `data_fim` (date)
- `status` (text, default 'A Fazer') — valores: A Fazer, Em Andamento, Concluído
- `created_at` (timestamptz, auto)

**custos**
- `id` (uuid, PK, auto)
- `projeto_id` (uuid, FK → projetos, ON DELETE CASCADE)
- `tipo_custo` (text, NOT NULL) — Fixo, Variável
- `categoria` (text, NOT NULL) — Software, Mão de obra, Marketing, Outros
- `valor` (numeric, NOT NULL, CHECK > 0)
- `data` (date, NOT NULL)
- `created_at` (timestamptz, auto)

### Segurança (RLS)
Como não há autenticação, as tabelas terão RLS desabilitado com políticas públicas de SELECT, INSERT, UPDATE e DELETE para acesso livre.

### Mudanças no Código

1. **Habilitar Lovable Cloud** e criar as 3 tabelas via migração
2. **Substituir o ProjectsContext** — trocar localStorage por queries/mutations usando `@tanstack/react-query` + cliente Supabase
3. **Criar hooks customizados**:
   - `useProjects` — listar, criar, editar projetos
   - `useTasks` — CRUD de tarefas por projeto
   - `useCosts` — CRUD de custos por projeto, com total acumulado
4. **Inserir dados de exemplo** via SQL (Projeto "Implantação de CRM" com tarefa e custo)
5. **Manter toda a UI existente** (Dashboard, Kanban, Custos) — apenas trocar a fonte de dados

### Fluxo
```text
UI Components
    ↓
React Query hooks (useProjects, useTasks, useCosts)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Lovable Cloud Database (PostgreSQL)
```

### O que NÃO muda
- Interface visual e componentes
- Kanban com drag and drop
- Formatação de moeda pt-BR
- Validações de formulário

