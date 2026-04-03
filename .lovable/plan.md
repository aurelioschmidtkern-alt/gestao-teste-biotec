

## Atualizar status do projeto automaticamente ao concluir todas as tarefas

### Resumo
Quando todas as tarefas de um projeto tiverem status "Concluído", o projeto será automaticamente atualizado para status "Concluído". Quando pelo menos uma tarefa não estiver concluída, o projeto volta para "Ativo".

### Abordagem
Adicionar lógica no `onSuccess` do `useUpdateTask` (e no `useDeleteTask`): após atualizar/excluir uma tarefa, buscar todas as tarefas do projeto e verificar se todas estão concluídas. Se sim, atualizar o projeto para "Concluído". Se não, garantir que o projeto esteja "Ativo".

### Mudanças

**`src/hooks/useTasks.ts`**:
- Criar função auxiliar `checkAndUpdateProjectStatus(projetoId)` que:
  1. Busca todas as tarefas do projeto
  2. Se houver tarefas e todas tiverem `status === "Concluído"`, atualiza `projetos.status` para "Concluído"
  3. Caso contrário, atualiza para "Ativo" (se estava "Concluído")
- Chamar essa função no `onSuccess` de `useUpdateTask` e `useDeleteTask`
- Invalidar query `["projetos"]` após a atualização

### O que NÃO muda
- Interface visual dos projetos, tarefas, custos
- Kanban, Meu Trabalho, login, usuários
- Estrutura do banco de dados (coluna `status` em `projetos` já existe)

