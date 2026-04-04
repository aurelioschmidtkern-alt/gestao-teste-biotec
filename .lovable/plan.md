

## Expandir Descrição ao Clicar na Tarefa — Plano

### Resumo
Adicionar toggle de expansão nos cards de tarefa em "Meu Trabalho": ao clicar no card, a descrição da tarefa aparece abaixo do nome. Clicar novamente recolhe.

### Alterações

**Arquivo: `src/pages/MyWork.tsx`**

1. Adicionar estado `expandedTaskId` (string | null) para controlar qual tarefa está expandida
2. Envolver o card com `onClick` que alterna o `expandedTaskId`
3. Adicionar `cursor-pointer` ao card
4. Abaixo do bloco com nome/projeto/badges, renderizar condicionalmente a descrição quando `expandedTaskId === task.id`
5. Se `task.descricao` for null/vazio, mostrar texto "Sem descrição" em itálico
6. Impedir que o clique no `Select` de status propague para o card (já é isolado pelo componente)
7. Usar `AnimatePresence` + `motion.div` para animar a entrada/saída da descrição

### Visual da descrição expandida
- Padding top com separador sutil (`border-t`)
- Texto `text-sm text-muted-foreground` com whitespace preservado (`whitespace-pre-wrap`)
- Animação suave de altura com framer-motion

### O que NÃO muda
- Funcionalidade existente (status, badges, criação de tarefa)
- Outros componentes/páginas

