

## Categorias Customizáveis nos Custos

### Resumo
Permitir que o usuário crie novas categorias de custo além das pré-definidas (Software, Mão de obra, Marketing, Outros), diretamente no formulário de custos.

### Abordagem
Sem alteração de banco de dados. As categorias já são armazenadas como texto livre na coluna `categoria`. Basta ajustar o formulário para combinar as categorias padrão com as categorias já usadas no projeto, e adicionar uma opção "Nova categoria" que exibe um campo de texto.

### Mudanças

**`src/components/CostForm.tsx`**:
- Receber a lista de custos existentes via nova prop `existingCategories: string[]`
- Combinar categorias padrão com categorias já usadas (sem duplicatas)
- Adicionar opção "Nova categoria..." no Select
- Quando selecionada, exibir um Input para digitar o nome da nova categoria
- Ao digitar, usar esse valor como categoria

**`src/components/CostsList.tsx`**:
- Extrair categorias únicas dos custos existentes
- Passar como prop `existingCategories` para o `CostForm`

### O que NÃO muda
- Tabela `custos` no banco
- Hooks de custos
- Demais telas e funcionalidades

