

## Menu Lateral (Sidebar) — Plano de Implementação

### Resumo
Criar uma sidebar colapsável com navegação agrupada, regras de visibilidade por perfil, e integrar com o layout existente usando `SidebarProvider` do shadcn. O `UserMenu` será mantido no topo direito. Todas as páginas internas passam a usar um layout compartilhado com sidebar.

### Arquivos

**Novo: `src/components/AppSidebar.tsx`**
- Sidebar com `collapsible="icon"`
- Grupos:
  - **Visão Geral**: Dashboard (`BarChart3`), Meu Trabalho (`ClipboardList`)
  - **Gestão**: Projetos (`FolderOpen`), Tarefas (link para Meu Trabalho ou projetos)
  - **Administração**: Usuários (`Users`) — visível apenas se `perfil === "Administrador"`
- Usa `NavLink` para destacar rota ativa
- Busca perfil via `useProfile()` para controlar visibilidade

**Novo: `src/components/AppLayout.tsx`**
- Layout wrapper com `SidebarProvider` + `AppSidebar` + área de conteúdo
- Header fixo no topo com `SidebarTrigger` (esquerda) e `UserMenu` (direita)
- `children` renderizados na área principal
- Substitui a repetição de header em cada página

**Editar: `src/App.tsx`**
- Envolver as rotas protegidas com `AppLayout`

**Editar: `src/pages/Index.tsx`, `MyWork.tsx`, `Dashboard.tsx`, `Users.tsx`, `ProjectDetail.tsx`**
- Remover headers individuais (botões de navegação, `UserMenu`, `ArrowLeft`)
- Manter apenas o conteúdo específico de cada página
- O layout com sidebar e header agora vem do `AppLayout`

### Regras de perfil
- Administrador: vê todos os itens incluindo "Usuários"
- Demais perfis: não veem "Usuários"
- Itens de "Tarefas" e "Custos" não terão rota própria (já estão dentro de projetos), então o grupo "Gestão" terá apenas "Projetos"
- O grupo "Financeiro > Custos" e "Sistema > Configurações" ficam para implementação futura (não existem como páginas independentes)

### Estrutura final da sidebar
```text
┌─────────────────┐
│  Nome do Sistema │
├─────────────────┤
│ VISÃO GERAL     │
│  📊 Dashboard   │
│  📋 Meu Trabalho│
├─────────────────┤
│ GESTÃO          │
│  📁 Projetos    │
├─────────────────┤
│ ADMINISTRAÇÃO   │
│  👥 Usuários    │  ← só admin
└─────────────────┘
```

### O que NÃO muda
- Funcionalidades existentes (Kanban, custos, tarefas, perfil)
- Banco de dados
- Hooks existentes
- Tela de login/registro

