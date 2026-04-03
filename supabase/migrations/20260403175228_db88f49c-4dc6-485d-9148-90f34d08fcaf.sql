
-- Tabela de projetos
CREATE TABLE public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tarefas
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT,
  data_inicio DATE,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'A Fazer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de custos
CREATE TABLE public.custos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  tipo_custo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para projetos
CREATE POLICY "Allow all select on projetos" ON public.projetos FOR SELECT USING (true);
CREATE POLICY "Allow all insert on projetos" ON public.projetos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on projetos" ON public.projetos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on projetos" ON public.projetos FOR DELETE USING (true);

-- Políticas públicas para tarefas
CREATE POLICY "Allow all select on tarefas" ON public.tarefas FOR SELECT USING (true);
CREATE POLICY "Allow all insert on tarefas" ON public.tarefas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on tarefas" ON public.tarefas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on tarefas" ON public.tarefas FOR DELETE USING (true);

-- Políticas públicas para custos
CREATE POLICY "Allow all select on custos" ON public.custos FOR SELECT USING (true);
CREATE POLICY "Allow all insert on custos" ON public.custos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on custos" ON public.custos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete on custos" ON public.custos FOR DELETE USING (true);
