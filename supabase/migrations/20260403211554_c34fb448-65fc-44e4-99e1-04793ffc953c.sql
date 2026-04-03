
UPDATE public.profiles SET perfil = 'Funcionario' WHERE perfil = 'Usuário';
ALTER TABLE public.profiles ALTER COLUMN perfil SET DEFAULT 'Funcionario';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'));
  RETURN NEW;
END;
$function$;
