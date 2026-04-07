

## Correção — Erro de DOM causado por tradução automática do navegador

### Diagnóstico

Este é um problema **conhecido e bem documentado** do React. Quando o tradutor automático do Chrome (ou outro navegador) traduz a página, ele modifica diretamente os nós de texto do DOM real — substituindo, removendo e criando novos nós. Na próxima reconciliação (re-render ou navegação de rota), o React tenta manipular os nós que ele "lembra" existirem, mas eles foram substituídos pelo tradutor. Resultado: `Failed to execute 'removeChild' on 'Node'` e tela branca.

O projeto não tem nenhum `dangerouslySetInnerHTML` ou manipulação direta de DOM problemática — o problema é 100% externo (tradutor vs Virtual DOM).

### Solução escolhida: Opção 1 — Bloquear tradução automática

É a solução **mais simples, segura e eficaz**. O sistema já está em português, então o tradutor não agrega valor — só causa problemas.

| Opção | Vantagens | Desvantagens | Complexidade |
|-------|-----------|--------------|-------------|
| **1. Bloquear tradução** | Resolve 100%, zero risco, 2 linhas | Usuários de outro idioma não terão tradução automática | Mínima |
| 2. Tornar resiliente | Não depende de meta tag | Impossível garantir 100% — React não suporta DOM externo alterado | Alta, frágil |
| 3. i18n interno | Controle total de idioma | Enorme esforço para traduzir todo o app | Muito alta |

### Alterações

**Arquivo: `index.html`**

1. Mudar `<html lang="en">` para `<html lang="pt-BR" translate="no">`
2. Adicionar `<meta name="google" content="notranslate">` no `<head>`

Isso instrui o Chrome (e outros navegadores) a **não oferecer nem executar** tradução automática na página.

### O que NÃO muda
- Nenhum componente React alterado
- Nenhuma dependência adicionada
- Funcionalidade do sistema intacta

