ALTER TABLE public.projetos
  ADD COLUMN deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamptz;

ALTER TABLE public.tarefas
  ADD COLUMN deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamptz;