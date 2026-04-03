

## Fix: Cards invisíveis na tela de Projetos

### Causa raiz
Os variants do `framer-motion` estão mal estruturados. A propriedade `transition` está definida como irmã de `initial`/`animate`, mas deveria estar **dentro** de `animate`. Resultado: os cards ficam presos em `opacity: 0` (estado initial) sem nunca animar para visível.

### Correção

**Arquivo: `src/pages/Index.tsx`**

Alterar o objeto `fadeInUp` de:
```js
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },  // ERRADO: fora do animate
};
```

Para:
```js
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
```

### Verificação adicional
Checar se o mesmo padrão incorreto existe em outras páginas (Dashboard, MyWork, Users, ProjectDetail) e corrigir também.

