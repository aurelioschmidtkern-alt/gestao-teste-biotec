

## Risco (line-through) nas Tarefas Concluídas no Kanban

### Alteração

**Arquivo: `src/components/KanbanBoard.tsx` — linha 146**

Adicionar `line-through` condicional no título da tarefa quando o status é "Concluído":

```typescript
// De:
<CardTitle className="text-sm flex-1 font-medium">{task.nome}</CardTitle>

// Para:
<CardTitle className={`text-sm flex-1 font-medium ${task.status === "Concluído" ? "line-through text-muted-foreground" : ""}`}>{task.nome}</CardTitle>
```

Também aplicar opacidade reduzida no card inteiro para reforçar visualmente:

```typescript
// Linha 139 — adicionar ao className do Card:
${task.status === "Concluído" ? "opacity-60" : ""}
```

### Resultado
- Ao arrastar para "Concluído", o nome da tarefa ganha um risco e o card fica levemente esmaecido
- Ao mover de volta para outra coluna, o estilo volta ao normal

