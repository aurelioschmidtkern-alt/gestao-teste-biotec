import { useProfile } from "./useProfile";

export type Permissions = {
  perfil: string;
  isLoading: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageUsers: boolean;
  canAccessCosts: boolean;
  canViewAllProjects: boolean;
  canAccessTrash: boolean;
};

export function usePermissions(): Permissions {
  const { profile, isLoading } = useProfile();
  const perfil = profile?.perfil || "Funcionario";

  if (isLoading || !profile) {
    return {
      perfil: "",
      isLoading: true,
      canCreateProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canManageUsers: false,
      canAccessCosts: false,
      canViewAllProjects: false,
      canAccessTrash: false,
    };
  }

  if (perfil === "Administrador") {
    return {
      perfil,
      isLoading: false,
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canManageUsers: true,
      canAccessCosts: true,
      canViewAllProjects: true,
      canAccessTrash: true,
    };
  }

  if (perfil === "Coordenador") {
    return {
      perfil,
      isLoading: false,
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canManageUsers: false,
      canAccessCosts: true,
      canViewAllProjects: true,
      canAccessTrash: true,
    };
  }

  return {
    perfil,
    isLoading: false,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageUsers: false,
    canAccessCosts: false,
    canViewAllProjects: false,
    canAccessTrash: false,
  };
}
