

## Expandir Descrição no Kanban — Plano

### Resumo
Adicionar toggle de expansão nos cards do Kanban: ao clicar no card, a descrição aparece abaixo das informações existentes. Clicar novamente recolhe. Mesmo padrão já implementado em "Meu Trabalho".

### Alterações

**Arquivo: `src/components/KanbanBoard.tsx`**

1. Adicionar estado `expandedTaskId` (string | null)
2. Adicionar `onClick` no `Card` que alterna `expandedTaskId`, com verificação para não disparar durante drag (`snapshot.isDragging`)
3. Adicionar `e.stopPropagation()` nos botões de editar e excluir para não conflitar com o toggle
4. Após o `CardContent` existente, renderizar condicionalmente a descrição com `AnimatePresence` + `motion.div`
5. Se `task.descricao` for null/vazio, mostrar "Sem descrição" em itálico
6. Importar `AnimatePresence` e `motion` de `framer-motion`

### Visual
- Separador `border-t` sutil acima da descrição
- Texto `text-xs text-muted-foreground whitespace-pre-wrap`
- Animação suave de altura/opacidade

### O que NÃO muda
- Drag and drop funcionalidade
- Botões de editar/excluir
- Layout das colunas

