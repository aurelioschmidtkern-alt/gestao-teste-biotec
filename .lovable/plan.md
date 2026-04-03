

## Responsáveis baseados em Usuários — Plano

### Resumo
Substituir campos de texto livre "Responsável" por seletores que buscam usuários cadastrados. Projetos terão select simples (1 responsável). Tarefas terão select com múltipla escolha.

### Database

**Migração**: Alterar a coluna `responsavel` na tabela `tarefas` de `text` para `text[]` (array de nomes) para suportar múltiplos responsáveis. A coluna `responsavel` em `projetos` permanece `text` (único responsável).

> Nota: Armazenaremos o **nome** do usuário (não o ID) para manter compatibilidade com dados existentes e simplicidade na exibição. Dados existentes serão preservados via migração que converte text para array.

```sql
ALTER TABLE tarefas 
ALTER COLUMN responsavel TYPE text[] 
USING CASE WHEN responsavel IS NOT NULL THEN ARRAY[responsavel] ELSE NULL END;
```

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useActiveUsers.ts` | **Novo** — Hook para buscar usuários ativos (`profiles` onde `status = 'Ativo'`) |
| `src/components/ProjectForm.tsx` | Trocar `<Input>` por `<Select>` com lista de usuários ativos |
| `src/components/TaskForm.tsx` | Trocar `<Input>` por multi-select com checkboxes (usando Popover + Command) |
| `src/components/KanbanBoard.tsx` | Exibir múltiplos responsáveis no card (array → lista de nomes) |
| `src/hooks/useTasks.ts` | Ajustar tipo para refletir `responsavel: string[]` |

### Detalhes técnicos

**`useActiveUsers`**: Query simples em `profiles` filtrando `status = 'Ativo'`, retorna `{ user_id, nome }`.

**ProjectForm**: Select simples com opções vindas do hook. Valor selecionado = nome do usuário. Opção vazia "Sem responsável".

**TaskForm**: Componente multi-select usando Popover + lista de checkboxes. Exibe badges dos selecionados. Estado interno é `string[]` de nomes.

**KanbanBoard**: Linha `task.responsavel` passa de `string` para `string[]`, exibir com `.join(", ")`.

### O que NÃO muda
- Estrutura de projetos e custos
- Tela de login/registro
- Gerenciamento de usuários
- RLS policies existentes

