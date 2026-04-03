import { useProfile } from "./useProfile";

export type Permissions = {
  perfil: string;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageUsers: boolean;
  canAccessCosts: boolean;
  canViewAllProjects: boolean;
};

export function usePermissions(): Permissions {
  const { profile } = useProfile();
  const perfil = profile?.perfil || "Funcionario";

  if (perfil === "Administrador") {
    return {
      perfil,
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canManageUsers: true,
      canAccessCosts: true,
      canViewAllProjects: true,
    };
  }

  if (perfil === "Coordenador") {
    return {
      perfil,
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canManageUsers: false,
      canAccessCosts: true,
      canViewAllProjects: true,
    };
  }

  // Funcionario
  return {
    perfil,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageUsers: false,
    canAccessCosts: false,
    canViewAllProjects: false,
  };
}
