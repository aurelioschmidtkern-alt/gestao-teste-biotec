

## Dashboard Avançado — Plano de Implementação

### Resumo
Criar uma página `/dashboard` com painel executivo contendo cards de resumo, gráficos (recharts já disponível), lista de projetos em andamento, tarefas críticas e ações rápidas. Filtro por perfil: admin vê tudo, usuário comum vê apenas seus projetos/tarefas.

### Arquivos

**Novo: `src/hooks/useDashboard.ts`**
- Hook que busca dados agregados: todos os projetos, todas as tarefas, todos os custos
- Calcula métricas: projetos ativos, tarefas em andamento/concluídas/atrasadas, total de custos
- Filtra por perfil do usuário (admin = global, usuário = apenas projetos onde é responsável ou tarefas atribuídas)

**Novo: `src/pages/Dashboard.tsx`**
Estrutura vertical:

1. **Cards de resumo** (topo, grid 5 colunas): Projetos ativos, Tarefas em andamento, Tarefas concluídas, Tarefas atrasadas (vermelho), Total de custos (R$)

2. **Gráficos** (grid 3 colunas):
   - Donut: Tarefas por status (A Fazer / Em Andamento / Concluído) — cores consistentes com Kanban
   - Barras: Tarefas por prazo (No prazo verde / Atenção amarelo / Atrasadas vermelho) — reutiliza lógica de `taskUrgency.ts`
   - Barras: Custos por categoria — valores em R$

3. **Projetos em andamento** (tabela): nome, status, responsável, qtd tarefas, badge de progresso

4. **Tarefas críticas** (lista, max 10): atrasadas e vencendo hoje/amanhã, ordenadas por urgência. Exibe nome, projeto, responsáveis, data, status

5. **Ações rápidas** (botões): Novo Projeto, Nova Tarefa. Admin vê todos, usuário comum não vê "Novo Projeto"

- Usa `recharts` (já instalado) com `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` do componente `ui/chart`
- Header com navegação de volta e `UserMenu`

**Editar: `src/App.tsx`**
- Adicionar rota `/dashboard` protegida

**Editar: `src/pages/Index.tsx`**
- Adicionar botão "Dashboard" no header que navega para `/dashboard`

### Regras de perfil
- `useProfile()` retorna `perfil` do usuário
- Admin/Coordenador: dados globais
- Usuário: filtra projetos onde `responsavel` inclui seu nome, e tarefas onde `responsavel[]` inclui seu nome

### O que NÃO muda
- Kanban, Meu Trabalho, custos, login, usuários
- Banco de dados (usa dados existentes)
- Hooks existentes (apenas cria novo `useDashboard`)

