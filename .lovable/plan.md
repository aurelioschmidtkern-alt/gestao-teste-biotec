

## Otimização do `useProjects` — Diagnóstico e Plano

### Diagnóstico

| Uso | Tela | Campos necessários |
|---|---|---|
| Listagem completa | **Index** | `id, nome, status, responsavel, created_at, descricao` |
| Dropdown | **Dashboard** | `id, nome` |
| Dropdown | **MyWork** | `id, nome` |
| Type export | **ProjectForm** | `Projeto` type (não executa query) |
| Mutation only | **ProjectDetail** | `useUpdateProject` (não executa query de leitura) |

### Problemas identificados

1. **Colunas `deleted` e `deleted_at` no select** — sempre retornam `false` e `null` respectivamente (filtro `.eq("deleted", false)` garante isso). São 2 campos trafegados sem valor informativo.

2. **Sem `staleTime` específico** — usa global (60s). Como o hook é compartilhado entre 3 telas, o cache deveria ser mais durável para evitar refetch ao navegar.

3. **Sem `refetchOnWindowFocus: false`** — toda troca de aba refaz a query.

4. **Ordenação `.order("created_at")` trafegada para dropdowns** — não prejudica (o banco já faz isso rápido com poucos registros), mas é desnecessária para Dashboard e MyWork.

### Decisão: manter hook único

Criar dois hooks separados (um leve para dropdowns, outro completo para Index) **não vale a pena** porque:
- O volume de projetos é pequeno (dezenas, não milhares)
- O cache compartilhado já evita queries duplicadas — Dashboard, MyWork e Index reusam o mesmo cache
- Separar criaria dois caches independentes com invalidação duplicada

### Alterações

**`src/hooks/useProjects.ts` — linha 11-15**

1. Remover `deleted, deleted_at` do select (sempre `false`/`null`)
2. Adicionar `staleTime: 2 * 60 * 1000` e `refetchOnWindowFocus: false`

```typescript
// De:
.select("id, nome, status, responsavel, created_at, descricao, deleted, deleted_at")
.eq("deleted", false)
.order("created_at", { ascending: false });

// Para:
.select("id, nome, status, responsavel, created_at, descricao")
.eq("deleted", false)
.order("created_at", { ascending: false });
```

Adicionar opções de cache:
```typescript
staleTime: 2 * 60 * 1000,
refetchOnWindowFocus: false,
```

**`useDeletedProjects` — linha 27**

Substituir `select("*")` por colunas específicas: `id, nome, status, responsavel, deleted_at`.

### O que NÃO muda
- Estrutura do banco
- Formato de retorno (campos usados pela UI continuam presentes)
- Mutations (`useCreateProject`, `useUpdateProject`, etc.)
- Nenhuma tela precisa de ajuste

### Impacto esperado
- **Menos dados por request** (2 colunas removidas de cada projeto)
- **Menos refetch** entre telas (staleTime 2min + cache compartilhado)
- **Sem refetch ao trocar aba** (refetchOnWindowFocus: false)

