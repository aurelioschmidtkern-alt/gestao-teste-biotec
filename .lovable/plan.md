

## Exibir Data Fim nos Cards do Meu Trabalho

### Alteração

**Arquivo: `src/pages/MyWork.tsx` — linhas 219-221**

Trocar `task.data_inicio` por `task.data_fim`:

```typescript
// De:
{task.data_inicio && (
  <span className="...">{formatDateBR(task.data_inicio)}</span>
)}

// Para:
{task.data_fim && (
  <span className="...">{formatDateBR(task.data_fim)}</span>
)}
```

Alteração de uma única linha. Nada mais muda.

