ALTER TABLE tarefas 
ALTER COLUMN responsavel TYPE text[] 
USING CASE WHEN responsavel IS NOT NULL THEN ARRAY[responsavel] ELSE NULL END;