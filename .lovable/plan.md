

## Remover confirmação de e-mail

### Objetivo
Ativar auto-confirmação de e-mail para que novos usuários possam acessar o sistema imediatamente após o cadastro, sem precisar verificar o e-mail.

### Mudanças

1. **Configuração do Lovable Cloud** — Usar `cloud--configure_auth` para ativar `enable_signup: true` e `autoconfirm: true` no provider de e-mail.

2. **`src/pages/Auth.tsx`** — Após registro bem-sucedido, redirecionar direto para o dashboard ao invés de mostrar mensagem "Verifique seu e-mail". Alterar a mensagem de sucesso para "Conta criada com sucesso!" e navegar para `/`.

### O que NÃO muda
- Tela de login visual
- Hook `useAuth`
- Todas as demais funcionalidades (projetos, tarefas, custos, Kanban)

