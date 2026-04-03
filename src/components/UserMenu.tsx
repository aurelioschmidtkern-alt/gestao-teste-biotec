import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { User, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const nome = profile?.nome || "Usuário";
  const fotoUrl = (profile as any)?.foto_url as string | null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 outline-none cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            {fotoUrl && <AvatarImage src={fotoUrl} alt={nome} />}
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline">{nome}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" /> Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut().then(() => navigate("/auth"))} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile ? { nome: profile.nome, foto_url: fotoUrl } : null}
      />
    </>
  );
}
