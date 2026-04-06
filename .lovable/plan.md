

## Permitir Coordenador Ver Todos os Usuários para Atribuir Responsáveis

### Problema
A política de segurança (RLS) na tabela `profiles` só permite que o próprio usuário ou Administradores vejam os perfis. Coordenadores não conseguem listar todos os usuários, então o dropdown de responsáveis aparece vazio ao criar tarefas.

### Solução

**1. Migration — criar função `is_coordinator` e atualizar RLS**

- Criar função `is_coordinator(_user_id uuid)` similar à `is_admin` existente
- Alterar a política "Users can view profiles" para incluir Coordenadores:
  ```sql
  (auth.uid() = user_id) OR is_admin(auth.uid()) OR is_coordinator(auth.uid())
  ```

**2. Nenhuma alteração de código frontend necessária**
O `TaskForm` já usa `useActiveUsers()` que lista todos os perfis ativos. Ao liberar a leitura via RLS, o dropdown funcionará automaticamente para Coordenadores.

### O que NÃO muda
- Permissões de edição/exclusão de perfis
- Lógica do formulário de tarefas
- Qualquer outro componente

