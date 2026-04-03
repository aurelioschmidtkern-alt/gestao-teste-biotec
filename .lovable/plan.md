

## Filtro por Projeto no Dashboard

### Resumo
Adicionar um select/dropdown no header do Dashboard que permite filtrar todos os dados (métricas, gráficos, listas) por um projeto específico. Opção padrão "Todos os projetos".

### Mudanças

**`src/pages/Dashboard.tsx`**
- Adicionar estado local `selectedProjectId` (string | null, default null)
- No header, adicionar um `Select` com a lista de projetos vindos de `data.projects` + opção "Todos os projetos"
- Após desestruturar `data`, aplicar filtro local:
  - Se `selectedProjectId` estiver setado, filtrar `tasks` e `costs` por `projeto_id`, e `projects` pelo `id`
  - Recalcular `metrics`, `tasksByStatus`, `tasksByDeadline`, `costsByCategory` e `criticalTasks` com os dados filtrados
- Mover a lógica de cálculo de métricas/gráficos do hook para uma função utilitária reutilizável, ou duplicar o cálculo inline no componente após o filtro

**Abordagem mais limpa**: Passar `selectedProjectId` para o hook `useDashboard` como parâmetro, e aplicar o filtro lá dentro antes de calcular as métricas.

**`src/hooks/useDashboard.ts`**
- Aceitar parâmetro opcional `projectId?: string | null`
- Se definido, filtrar `projects`, `tasks` e `costs` por esse projeto antes de calcular métricas
- Adicionar `projectId` ao `queryKey`

### Interface
- Select posicionado no header, entre o título e os botões de ação
- Opções: "Todos os projetos" + lista dos projetos do usuário
- Ao mudar, os dados do dashboard atualizam automaticamente via React Query

### O que NÃO muda
- Estrutura visual do dashboard
- Banco de dados
- Demais telas

