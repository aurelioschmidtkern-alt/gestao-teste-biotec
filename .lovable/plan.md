

## Ajuste de Responsividade Mobile — Plano

### Problemas identificados

A partir da screenshot (390px) e da análise do código, os seguintes problemas existem em mobile:

**1. MyWork (Meu Trabalho)** — Os cards de tarefa usam `flex items-center gap-4` com o select de status em `w-36 shrink-0`, comprimindo o nome da tarefa (que fica invisível). Badges de prioridade e urgência também competem por espaço na mesma linha.

**2. Dashboard** — Padding `p-8` é excessivo em mobile. Grid de métricas `grid-cols-2` funciona, mas gráficos em `md:grid-cols-3` caem para 1 coluna (ok). Header com select de `w-[220px]` pode apertar.

**3. Users** — Grid fixo `grid-cols-[1fr_1fr_120px_100px_100px_80px]` não cabe em tela < 768px. Conteúdo transborda.

**4. CostsList** — Mesmo problema: grid fixo `grid-cols-[100px_1fr_120px_100px_80px]` transborda em mobile.

**5. ProjectDetail** — Header do projeto com botão voltar + título + badge + botão editar na mesma linha pode apertar.

**6. Kanban** — Grid `grid-cols-1 md:grid-cols-3` já é responsivo (ok), mas cards podem ser mais compactos.

**7. Padding geral** — Todas as páginas usam `p-8`, que é excessivo em telas < 640px.

---

### Correções

#### Todas as páginas (padding)
- Trocar `p-8` por `p-4 sm:p-6 lg:p-8` em: Dashboard, Index, MyWork, Users, ProjectDetail

#### `src/pages/MyWork.tsx`
- **Layout do card de tarefa**: trocar de `flex items-center gap-4` (tudo numa linha) para layout empilhado em mobile:
  - Mobile: nome da tarefa + projeto em cima, status select + badges embaixo
  - Desktop: manter layout horizontal atual
- Usar `flex flex-col sm:flex-row` no container interno
- Mover o select de status para `w-28 sm:w-36`
- Agrupar badges em uma linha separada no mobile

#### `src/pages/Dashboard.tsx`
- Header: `flex-col sm:flex-row` para título e filtro
- Select: `w-full sm:w-[220px]`
- Grid de métricas: manter `grid-cols-2`, reduzir gap em mobile

#### `src/pages/Users.tsx`
- Trocar grid fixo por layout de card em mobile:
  - `hidden md:grid` no header da tabela e nas linhas tabulares
  - Adicionar versão mobile (`md:hidden`) com layout empilhado: nome, email, badges, ações

#### `src/components/CostsList.tsx`
- Mesmo padrão de Users: grid fixo visível apenas em `md:`, versão card em mobile
- Cards de métricas: `grid-cols-1 sm:grid-cols-2`

#### `src/pages/ProjectDetail.tsx`
- Header: `flex-col sm:flex-row` para título e botão editar
- Badges de status do projeto selecionado: `flex-wrap`

#### `src/components/KanbanBoard.tsx`
- Já responsivo (grid-cols-1 em mobile), sem mudanças necessárias

---

### Arquivos modificados
1. `src/pages/MyWork.tsx` — layout empilhado em mobile
2. `src/pages/Dashboard.tsx` — padding e header responsivos
3. `src/pages/Index.tsx` — padding responsivo
4. `src/pages/Users.tsx` — tabela adaptada para mobile
5. `src/pages/ProjectDetail.tsx` — header responsivo
6. `src/components/CostsList.tsx` — tabela e cards adaptados

### O que NÃO muda
- Funcionalidade, hooks, lógica de negócio
- Sidebar (já colapsável via shadcn)
- Kanban (já responsivo)

