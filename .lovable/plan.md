

## Tela "Meu Trabalho" — Plano de Implementação

### Resumo
Criar uma tela centralizada que exibe todas as tarefas do usuário logado, agrupadas por período (Hoje, Esta semana, Semana que vem, Mais tarde, Sem data), com edição rápida de status e criação de tarefas.

### Database

**Migração**: Adicionar coluna `prioridade` (text, nullable, default NULL) na tabela `tarefas`. Valores: Baixa, Média, Alta.

```sql
ALTER TABLE tarefas ADD COLUMN prioridade text DEFAULT NULL;
```

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/MyWork.tsx` | Tela principal "Meu Trabalho" |
| `src/hooks/useMyTasks.ts` | Hook para buscar tarefas do usuário logado (filtra por nome no array `responsavel`) |

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/meu-trabalho` |
| `src/pages/Index.tsx` | Adicionar botão "Meu Trabalho" no header |
| `src/components/TaskForm.tsx` | Adicionar campo `prioridade` (select: Baixa/Média/Alta) e campo opcional `projeto_id` (para criação via Meu Trabalho) |

### Detalhes da Tela "Meu Trabalho"

**`useMyTasks`**: Busca todas as tarefas com join no nome do projeto (`projetos.nome`). Filtra client-side pelo nome do usuário logado no array `responsavel` (usando o perfil do usuário). Agrupa por data usando `data_inicio`:

- **Hoje**: `data_inicio === hoje`
- **Esta semana**: dentro da semana atual, excluindo hoje
- **Semana que vem**: dentro da próxima semana
- **Mais tarde**: após a próxima semana
- **Sem data**: `data_inicio` é null

**Cada linha exibe**: nome da tarefa, nome do projeto, responsáveis (badges), data, status (select editável), prioridade.

**Edição de status**: Select inline na linha da tarefa. Ao mudar, chama `useUpdateTask` que atualiza no banco — reflete automaticamente no Kanban via React Query invalidation.

**Criar tarefa**: Botão "Novo Elemento" abre `TaskForm` com campo adicional para selecionar o projeto.

### O que NÃO muda
- Kanban, custos, projetos, login, usuários
- Hooks existentes (useProjects, useTasks, useCosts)
- Estrutura de dados existente (apenas adiciona coluna `prioridade`)

