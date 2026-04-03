

## Redesign Visual Premium — Plano de Implementação

### Resumo
Refatoração visual completa do frontend para aparência de SaaS profissional, inspirado em Monday/Linear/Asana. Alterações puramente visuais — toda funcionalidade existente permanece intacta. Será dividido em etapas por área do sistema.

### Dependência
Instalar `framer-motion` para microinterações e animações de entrada.

---

### 1. Paleta e Design Tokens (`src/index.css`)

Atualizar todas as CSS variables para a nova paleta:
- `--background`: `#F6F7FB` (cinza azulado claro)
- `--foreground`: `#111827` (quase preto, nunca preto puro)
- `--card`: `#FFFFFF`
- `--primary`: `217 91% 60%` (azul `#2563EB`)
- `--muted-foreground`: `#6B7280`
- `--border`: `#E5E7EB` (mais sutil)
- Sidebar: fundo escuro (`#1E293B`), texto claro, acento violeta/azul
- Adicionar variáveis custom: `--accent-violet: 263 70% 50%`
- `--radius: 0.75rem` (cantos mais arredondados)
- Adicionar font-family Inter via Google Fonts no `index.html`

### 2. Sidebar Premium (`src/components/AppSidebar.tsx`)

Redesign completo:
- Fundo escuro (slate-900) com texto claro
- Logo/nome do sistema com tipografia forte no topo
- Grupos com labels uppercase, tracking-wider, text-xs, opacidade reduzida
- Item ativo: fundo com opacidade + borda lateral esquerda colorida (azul primário)
- Hover suave com `transition-all duration-200`
- Ícones com `strokeWidth={1.5}` para aparência mais fina
- Espaçamento vertical generoso entre itens
- Versão colapsada mantém ícones centralizados
- Animação de transição ao colapsar/expandir

### 3. Header Superior (`src/components/AppLayout.tsx`)

- Fundo branco, borda inferior muito sutil (`border-b border-gray-100`)
- SidebarTrigger estilizado com hover suave
- UserMenu à direita com avatar + nome mais elegante
- Altura confortável (`h-16`)
- Sombra sutil opcional (`shadow-sm`)

### 4. UserMenu (`src/components/UserMenu.tsx`)

- Avatar com ring sutil na cor primária
- Nome do usuário com font-medium
- Dropdown com animação de entrada, ícones refinados
- Separação visual mais clara entre itens

### 5. Dashboard (`src/pages/Dashboard.tsx`)

- **Cards de métricas**: fundo branco, ícone em container colorido arredondado, número grande (text-3xl font-bold), label em text-xs uppercase tracking-wider. Sombra `shadow-sm`. Animação de entrada com framer-motion `fadeInUp`.
- **Gráficos**: cards maiores com mais padding, títulos semibold, paleta de cores consistente
- **Seções de projetos**: cards com hover `scale(1.01)` e `shadow-md`, badge de status com cores mais refinadas (verde, amarelo, cinza com opacidade)
- **Tarefas críticas**: borda lateral colorida por urgência, tipografia melhor
- Título da página: `text-3xl font-semibold`, subtítulo `text-sm text-gray-500`

### 6. Tela de Projetos (`src/pages/Index.tsx`)

- Cards de projeto com `shadow-sm hover:shadow-md transition-all duration-200`
- Status badge com cores mais suaves (fundo com opacidade, texto forte)
- Nome do projeto em `font-semibold text-base`
- Responsável com ícone discreto
- Data de criação em `text-xs text-gray-400`
- Botão "Novo Projeto" com cor primária forte, ícone + texto
- Estado vazio com ilustração/ícone maior e texto mais elegante
- Grid com gap maior

### 7. Kanban Board (`src/components/KanbanBoard.tsx`)

Inspiração Monday:
- **Colunas**: cabeçalho colorido por status (A Fazer: cinza slate, Em Andamento: azul, Concluído: verde) com texto branco, cantos arredondados no topo
- Contador de tarefas no cabeçalho
- Fundo da coluna: cor do status com opacidade muito baixa (`bg-blue-50/50`)
- **Cards de tarefa**: fundo branco, `shadow-sm`, borda lateral esquerda colorida por prioridade/urgência
- Ícone de grip mais discreto
- Responsáveis com avatar fallback pequeno
- Datas com formatação melhor
- Badge de urgência com cores consistentes
- Ações (editar/excluir) aparecem no hover
- Animação ao arrastar: `shadow-lg ring-2 ring-primary/30`

### 8. Meu Trabalho (`src/pages/MyWork.tsx`)

- Layout de lista profissional
- Cards mais compactos com padding reduzido
- Select de status inline com badge colorida
- Nome da tarefa em `font-medium`
- Projeto em texto discreto sem emoji
- Badges de prioridade com cores refinadas
- Indicador de prazo com cor (verde/amarelo/vermelho) como dot ou barra lateral
- Grupo headers com tipografia forte, badge de contagem arredondada
- Separadores sutis entre grupos

### 9. Tela de Usuários (`src/pages/Users.tsx`)

- Tabela sem bordas pesadas — usar `divide-y divide-gray-100`
- Cabeçalho com `text-xs uppercase tracking-wider text-gray-500`
- Linhas com hover `bg-gray-50/50`
- Badges de perfil com cores distintas (Admin: azul, Coordenador: violeta, Funcionário: cinza)
- Badges de status (Ativo: verde, Inativo: vermelho)
- Ações com opacidade reduzida, aparecem mais fortes no hover
- Espaçamento vertical maior entre linhas

### 10. Custos (`src/components/CostsList.tsx`)

- Cards de métricas com ícone em container colorido
- Tabela clean com mesmo padrão de Usuários
- Valores monetários em `font-semibold` com cor de destaque
- Badges de tipo custo mais elegantes

### 11. Tela de Login (`src/pages/Auth.tsx`)

- Fundo com gradiente sutil (branco para cinza azulado)
- Card centralizado com `shadow-lg`, padding generoso
- Logo/ícone maior com cor primária
- Título forte, subtítulo elegante
- Inputs com altura maior, bordas mais suaves, focus ring na cor primária
- Botão primário com gradiente sutil ou cor forte
- Tab switcher mais refinado

### 12. Componentes Base (Tailwind classes, sem alterar shadcn source)

Aplicar via className nos componentes:
- Cards: `shadow-sm hover:shadow-md transition-shadow` onde aplicável
- Inputs/Selects: `h-11` (mais altura), `focus-visible:ring-primary`
- Botão primário: usar classes `bg-primary hover:bg-primary/90 shadow-sm`
- Badges: `rounded-full px-3 py-0.5 text-xs font-medium`

### 13. Microinterações (framer-motion)

- `motion.div` com `initial={{ opacity: 0, y: 20 }}` e `animate={{ opacity: 1, y: 0 }}` nos containers principais de cada página
- Stagger children nos grids de cards
- Hover scale nos cards interativos
- Transições CSS: `transition-all duration-200` em botões, cards, linhas de tabela

### Arquivos modificados (resumo)
1. `index.html` — adicionar font Inter
2. `src/index.css` — nova paleta de cores
3. `src/components/AppLayout.tsx` — header premium
4. `src/components/AppSidebar.tsx` — sidebar escura premium
5. `src/components/UserMenu.tsx` — avatar e dropdown refinados
6. `src/pages/Dashboard.tsx` — layout premium com animações
7. `src/pages/Index.tsx` — cards de projeto refinados
8. `src/pages/ProjectDetail.tsx` — header e tabs premium
9. `src/components/KanbanBoard.tsx` — estilo Monday
10. `src/pages/MyWork.tsx` — lista profissional
11. `src/pages/Users.tsx` — tabela clean
12. `src/components/CostsList.tsx` — tabela e cards clean
13. `src/pages/Auth.tsx` — login premium

### O que NÃO muda
- Lógica de negócio, hooks, queries, mutations
- Sistema de permissões (RBAC)
- Banco de dados, RLS, edge functions
- Roteamento
- Drag and drop funcionalidade
- Componentes shadcn source (ui/)

