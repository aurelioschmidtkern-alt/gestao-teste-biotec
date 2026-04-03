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
import { User, LogOut } from "lucide-react";

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
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
          <Avatar className="h-8 w-8">
            {fotoUrl && <AvatarImage src={fotoUrl} alt={nome} />}
            <AvatarFallback className="text-sm">
              {nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline">{nome}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="h-4 w-4 mr-2" /> Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut().then(() => navigate("/auth"))}>
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
