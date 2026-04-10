import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "permanent_delete"
  | "status_change";

export type AuditEntity = "tarefa" | "projeto" | "custo" | "usuario";

interface AuditEntry {
  action: AuditAction;
  entity: AuditEntity;
  entity_id: string;
  entity_name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  profileId?: string;
}

export async function logAudit(entry: AuditEntry) {
  try {
    let pid = entry.profileId ?? null;

    if (!pid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      pid = profile?.id ?? null;
    }

    await supabase.from("audit_logs" as any).insert({
      profile_id: pid,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      entity_name: entry.entity_name ?? null,
      description: entry.description ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // silencioso — auditoria não deve quebrar fluxo
  }
}
