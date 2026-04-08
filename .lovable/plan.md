

## Otimização do `useMyTasks` — Diagnóstico e Plano

### Diagnóstico

O hook já está **razoavelmente otimizado** graças à etapa anterior. Veja o estado atual:

| Critério | Status | Detalhe |
|---|---|---|
| `SELECT *` | ✅ OK | Já seleciona colunas específicas |
| Filtro por usuário | ✅ OK | `.contains("responsavel", [userName])` no banco |
| Filtro `deleted` | ✅ OK | `.eq("deleted", false)` no banco |
| Filtro `Concluído` | ✅ OK | `.neq("status", "Concluído")` no banco |
| Ordenação | ✅ OK | `.order("data_fim")` — necessária para a UI |
| Join | ✅ OK | Apenas `projetos(nome)` — mínimo necessário |
| Cache (`staleTime`) | ⚠️ Usa global (60s) | Dados pessoais mudam com pouca frequência, poderia ser maior |
| `refetchOnWindowFocus` | ⚠️ Ativo | Refaz a query toda vez que o usuário volta à aba |
| Query extra de `profiles` | ⚠️ Redundante | Faz 1 query extra para buscar o nome do usuário. O hook `useProfile` já tem esse dado cacheado |
| `data_inicio` e `created_at` | ⚠️ Desnecessários | `data_inicio` não é usado na UI do MyWork. `created_at` também não aparece na tela |

### Gargalos reais

1. **Query extra no `profiles`** — toda vez que o hook executa, faz uma query separada ao `profiles` para obter o nome do usuário. Esse dado já está disponível no `useProfile()` cacheado. São **2 queries por acesso** ao Meu Trabalho quando poderia ser 1.

2. **Sem `staleTime` específico** — depende do global (60s). Tarefas do usuário não mudam tão rápido; 2 minutos seria adequado.

3. **`refetchOnWindowFocus` ativo** — ao alternar abas, refaz as 2 queries imediatamente.

4. **Colunas `data_inicio` e `created_at`** — trafegadas mas não usadas na tela.

### Alterações

**`src/hooks/useMyTasks.ts`**

1. **Eliminar query ao `profiles`** — importar `useProfile` e usar o nome já cacheado como dependência:
   ```typescript
   import { useProfile } from "./useProfile";
   
   export function useMyTasks() {
     const { user } = useAuth();
     const { data: profile } = useProfile();
     const userName = profile?.nome;
   
     return useQuery({
       queryKey: ["my-tasks", user?.id, userName],
       enabled: !!user?.id && !!userName,
       staleTime: 2 * 60 * 1000,
       refetchOnWindowFocus: false,
       queryFn: async () => {
         // Query direta sem buscar profile novamente
         const { data, error } = await supabase
           .from("tarefas")
           .select("id, nome, descricao, status, data_fim, responsavel, prioridade, projeto_id, projetos(nome)")
           ...
       },
     });
   }
   ```

2. **Remover `data_inicio` e `created_at`** do select — não são usados na UI

3. **Adicionar `staleTime: 2 * 60 * 1000`** e **`refetchOnWindowFocus: false`**

4. **Atualizar interface `MyTask`** — remover `data_inicio` e `created_at`

### Impacto esperado

| Melhoria | Efeito |
|---|---|
| Eliminar query `profiles` | **-1 query por acesso** (50% menos queries) |
| `staleTime` 2min | Evita refetch ao navegar de volta à tela |
| `refetchOnWindowFocus: false` | Evita refetch ao alternar abas |
| Remover 2 colunas | Reduz payload marginalmente |

### O que NÃO muda
- Agrupamentos por data na tela
- Visual dos cards
- Lógica de status/urgência
- Outros hooks

