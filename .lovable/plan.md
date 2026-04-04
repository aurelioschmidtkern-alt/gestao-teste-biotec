

## Adicionar Seção "Atrasadas" acima de "Hoje" no Meu Trabalho

### Resumo
Criar um novo grupo "Atrasadas" que aparece como primeira seção, acima de "Hoje". Tarefas com `data_fim` anterior à data atual (e status diferente de "Concluído") serão agrupadas nesta seção com destaque visual vermelho.

### Alterações

**Arquivo: `src/pages/MyWork.tsx`**

1. Adicionar `"overdue"` ao type `GroupKey` e ao `GROUP_LABELS`:
   - `overdue: "Atrasadas"`

2. Atualizar `groupTasksByDate` para classificar tarefas atrasadas:
   - Verificar `task.data_fim`: se existir e `parseISO(data_fim) < today`, adicionar ao grupo `overdue`
   - A classificação por atraso tem prioridade sobre a classificação por `data_inicio`

3. Atualizar a ordem dos grupos para `["overdue", "today", "thisWeek", "nextWeek", "later", "noDate"]`

4. Usar ícone `AlertTriangle` (Lucide) e cor vermelha no header do grupo "Atrasadas" para destaque visual

### O que NÃO muda
- Funcionalidade existente (status, expansão, criação)
- Outros grupos continuam funcionando igual
- Lógica de urgência nos cards (border colorido) permanece

