

## Substituir `confirm()` por AlertDialog

### Problema
Os diálogos de confirmação de exclusão usam `window.confirm()` nativo do navegador, que exibe URL interna e visual fora do padrão do projeto.

### Solução
Substituir por `AlertDialog` (já usado na página Trash.tsx como referência).

### Alterações

**1. `src/components/KanbanBoard.tsx` — linha 151**
- Substituir o `Button` com `confirm()` por `AlertDialog` + `AlertDialogTrigger` wrapping o botão de lixeira
- Ao confirmar, chamar `deleteTask.mutate()`

**2. `src/pages/Index.tsx` — linhas 118-131**
- Substituir o `Button` com `confirm()` por `AlertDialog` + `AlertDialogTrigger` wrapping o botão de lixeira
- Ao confirmar, chamar `deleteProject.mutate()`

### Padrão (mesmo usado em `Trash.tsx`)
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button size="icon" variant="ghost" ...>
      <Trash2 />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Mover para a lixeira?</AlertDialogTitle>
      <AlertDialogDescription>
        O item será movido para a lixeira. Você poderá restaurá-lo depois.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => mutate(...)}>
        Mover para lixeira
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### O que NÃO muda
- Lógica de soft delete
- Visual dos cards
- Permissões

