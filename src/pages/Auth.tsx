import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const navigate = useNavigate();
  const { session, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  if (session) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (mode === "register" && !nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, senha);
        toast.success("Login realizado com sucesso!");
        navigate("/", { replace: true });
      } else {
        await signUp(nome, email, senha);
        toast.success("Conta criada com sucesso!");
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-3 pb-2 pt-8">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Projetos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus projetos, tarefas e custos
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="flex rounded-xl bg-muted p-1">
              <button
                type="button"
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("register")}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 font-medium shadow-sm" disabled={loading}>
                {loading
                  ? "Processando..."
                  : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
