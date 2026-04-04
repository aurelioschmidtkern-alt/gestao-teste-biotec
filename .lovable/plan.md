

## Categorizar Tarefas por Data Fim no Meu Trabalho

### Problema atual
A função `groupTasksByDate` usa `data_inicio` para agrupar tarefas em "Hoje", "Esta Semana", etc. Apenas o grupo "Atrasadas" usa `data_fim`. O usuário quer que **todos os grupos** sejam baseados em `data_fim`.

### Alteração

**Arquivo: `src/pages/MyWork.tsx` — função `groupTasksByDate`**

Trocar a lógica de agrupamento de `data_inicio` para `data_fim`:

```typescript
tasks.forEach((task) => {
  if (!task.data_fim) { groups.noDate.push(task); return; }
  const fim = parseISO(task.data_fim);
  
  if (isBefore(fim, todayStart) && task.status !== "Concluído") {
    groups.overdue.push(task);
  } else if (isToday(fim)) {
    groups.today.push(task);
  } else if (isThisWeek(fim, { weekStartsOn: 1 })) {
    groups.thisWeek.push(task);
  } else if (!isBefore(fim, nwStart) && !isAfter(fim, nwEnd)) {
    groups.nextWeek.push(task);
  } else if (isAfter(fim, nwEnd)) {
    groups.later.push(task);
  } else {
    groups.later.push(task);
  }
});
```

Também atualizar o hook `useMyTasks` para ordenar por `data_fim` em vez de `data_inicio`.

### O que NÃO muda
- Grupos e labels permanecem os mesmos
- Visual, expansão, status — tudo igual
- Lógica de "Atrasadas" já usa `data_fim`, então continua consistente

