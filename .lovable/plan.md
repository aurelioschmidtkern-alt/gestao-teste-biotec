

## Ocultar tarefas concluídas na tela "Meu Trabalho"

### Mudança

**`src/hooks/useMyTasks.ts`** — Adicionar filtro para excluir tarefas com `status === "Concluído"` no resultado final, após o filtro por responsável.

Uma única linha adicionada ao `.filter()` chain. Nenhum outro arquivo precisa ser alterado. As tarefas concluídas continuarão visíveis normalmente no Kanban do projeto.

