

## Exibir Apenas Primeiro Nome nos Responsáveis das Tarefas

### Alterações

**1. `src/lib/utils.ts` — adicionar função utilitária**
```typescript
export function getFirstName(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}
```

**2. `src/components/KanbanBoard.tsx`**
- Importar `getFirstName` de `@/lib/utils`
- Na linha do avatar (inicial do nome): já usa `charAt(0)` — sem mudança necessária
- Na exibição do nome do responsável (~linha 178, `formatResponsaveis`): aplicar `getFirstName` a cada nome
- Atualizar `formatResponsaveis` para mapear cada nome com `getFirstName`:
```typescript
const formatResponsaveis = (responsavel: string | string[] | null) => {
  if (!responsavel) return null;
  const names = Array.isArray(responsavel) ? responsavel : [responsavel];
  return names.map(getFirstName).join(", ");
};
```

**3. `src/pages/MyWork.tsx`**
- Importar `getFirstName`
- Nos badges de responsáveis (~linha 210), aplicar `getFirstName(r)` no texto do Badge

### O que NÃO muda
- Nome completo armazenado no banco
- Tela de usuários, perfil, formulários de cadastro/edição
- Dropdown de seleção de responsáveis no TaskForm

