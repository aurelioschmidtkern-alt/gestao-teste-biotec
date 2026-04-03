

## Ajuste na Dashboard — Filtro e Separação por Status de Projeto

### Resumo
Quando "Todos os projetos" estiver selecionado, a seção de projetos será dividida em 3 grupos por status (Ativos, Pausados, Concluídos), ocultando seções vazias. Quando um projeto específico for selecionado, exibir visão individual com destaque de status. Concluído passa a usar cinza em vez de azul.

### Mudanças

**`src/pages/Dashboard.tsx`**
- Substituir a seção "Projetos em Andamento" por lógica condicional:
  - **Se `selectedProjectId` é null** (todos): renderizar até 3 seções — "Projetos Ativos" (verde), "Projetos Pausados" (amarelo), "Projetos Concluídos" (cinza). Cada seção lista projetos daquele status com a mesma estrutura visual atual (card clicável com nome, responsável, badge de tarefas). Ocultar seção se vazia.
  - **Se projeto específico selecionado**: exibir card destacado com nome do projeto, status em badge colorido, responsável, e contagem de tarefas por status
- Atualizar `STATUS_COLORS.Concluído` de azul para cinza (`bg-gray-100 text-gray-800`)

**`src/hooks/useDashboard.ts`**
- Nenhuma alteração necessária (já retorna todos os projetos com status, e já filtra por `projectId`)

### Estrutura visual (todos os projetos)

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│ Projetos Ativos (verde)         │ Tarefas Críticas                │
│  - Projeto A  [2/5 tarefas]    │  - Tarefa X [Atrasada 3 dias]   │
│  - Projeto B  [0/3 tarefas]    │  - Tarefa Y [Vence hoje]        │
├─────────────────────────────────┤                                 │
│ Projetos Pausados (amarelo)     │                                 │
│  - Projeto C  [1/4 tarefas]    │                                 │
├─────────────────────────────────┤                                 │
│ Projetos Concluídos (cinza)     │                                 │
│  - Projeto D  [5/5 tarefas]    │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

### Estrutura visual (projeto específico)

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│ Projeto: Implantação CRM        │ Tarefas Críticas                │
│ Status: [Ativo] (badge verde)   │  (filtradas pelo projeto)       │
│ Responsável: João               │                                 │
│ Tarefas: 2 A Fazer, 1 Em And.  │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

### O que NÃO muda
- Gráficos, cards de resumo, tarefas críticas
- Hook `useDashboard`
- Banco de dados
- Demais telas

