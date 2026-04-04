

## Adicionar Campo de Descrição ao Projeto

### Alterações necessárias

**1. Migration — adicionar coluna `descricao` na tabela `projetos`**
```sql
ALTER TABLE public.projetos ADD COLUMN descricao text;
```
Coluna nullable, sem default — projetos existentes ficam com `null`.

**2. `src/components/ProjectForm.tsx`**
- Adicionar estado `descricao` inicializado com `initial?.descricao ?? ""`
- Adicionar campo `Textarea` entre Nome e Status com label "Descrição"
- Incluir `descricao` no objeto passado ao `onSubmit`
- Atualizar a interface `onSubmit` para incluir `descricao: string`
- Resetar `descricao` ao criar novo projeto

**3. `src/pages/Index.tsx`**
- Atualizar o `onSubmit` do `ProjectForm` para passar `descricao` ao `createProject.mutate`
- Opcionalmente exibir trecho da descrição nos cards de projeto (truncado em 2 linhas)

**4. `src/pages/ProjectDetail.tsx`**
- Atualizar o `onSubmit` do formulário de edição para incluir `descricao`
- Exibir a descrição do projeto no header da página de detalhes

### O que NÃO muda
- Hooks `useProjects` / `useCreateProject` / `useUpdateProject` já usam tipagem genérica do Supabase, então aceitarão o novo campo automaticamente após a migration
- Lógica de permissões, RLS, outras páginas

