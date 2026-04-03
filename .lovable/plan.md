

## Indicador de Urgência por Prazo — Plano

### Resumo
Criar função utilitária que calcula urgência com base em `data_fim` e `status`, retornando cor e texto descritivo. Aplicar visualmente nos cards do Kanban e na tela Meu Trabalho.

### Mudanças

**Novo: `src/lib/taskUrgency.ts`**
- Função `getTaskUrgency(dataFim: string | null, status: string)` que retorna `{ color, borderClass, label }`
- Regras:
  - Concluído → cinza, "Concluída"
  - Sem data → neutro, sem label
  - Atrasada → vermelho escuro (`border-l-4 border-red-800`), "Atrasada há X dias"
  - Hoje/amanhã → vermelho (`border-l-4 border-red-500`), "Vence hoje" / "Vence amanhã"
  - 2-3 dias → laranja (`border-l-4 border-orange-500`), "Vence em X dias"
  - 4-7 dias → amarelo (`border-l-4 border-yellow-500`), "Vence em X dias"
  - +7 dias → verde (`border-l-4 border-green-500`), "Prazo ok"

**Editar: `src/components/KanbanBoard.tsx`**
- Importar `getTaskUrgency`
- No `<Card>` de cada tarefa, adicionar `borderClass` ao className
- Exibir `label` como texto pequeno no `<CardContent>`

**Editar: `src/pages/MyWork.tsx`**
- Importar `getTaskUrgency`
- No `<Card>` de cada tarefa, adicionar `borderClass` ao className
- Exibir `label` como badge/texto ao lado da data

### O que NÃO muda
- Banco de dados, hooks, formulários, login, usuários

