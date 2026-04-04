import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.101.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await callerClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const callerId = claims.claims.sub as string;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile } = await adminClient.from("profiles").select("perfil").eq("user_id", callerId).single();
    if (callerProfile?.perfil !== "Administrador") {
      return new Response(JSON.stringify({ error: "Apenas administradores podem gerenciar usuários" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { email, password, nome, perfil } = body;
      if (!email || !password || !nome) {
        return new Response(JSON.stringify({ error: "Email, senha e nome são obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: user, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome },
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (perfil && perfil !== "Funcionario") {
        await adminClient.from("profiles").update({ perfil }).eq("user_id", user.user.id);
      }
      return new Response(JSON.stringify({ user: user.user }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update") {
      const { user_id, nome, perfil, status, password } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id é obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const updates: Record<string, string> = {};
      if (nome) updates.nome = nome;
      if (perfil) updates.perfil = perfil;
      if (status) updates.status = status;
      if (Object.keys(updates).length > 0) {
        await adminClient.from("profiles").update(updates).eq("user_id", user_id);
      }
      if (password) {
        const { error } = await adminClient.auth.admin.updateUserById(user_id, { password });
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id é obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (user_id === callerId) {
        return new Response(JSON.stringify({ error: "Você não pode excluir a si mesmo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Delete profile first
      await adminClient.from("profiles").delete().eq("user_id", user_id);
      // Delete auth user
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data: profiles, error } = await adminClient.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const emailMap = new Map(authUsers?.users?.map(u => [u.id, u.email]) ?? []);
      const enriched = profiles.map(p => ({ ...p, email: emailMap.get(p.user_id) ?? "" }));
      return new Response(JSON.stringify({ users: enriched }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
