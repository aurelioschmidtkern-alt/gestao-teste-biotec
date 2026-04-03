import { BarChart3, ClipboardList, FolderOpen, Users, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItemClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200";
const activeNavItemClass = "bg-sidebar-accent text-sidebar-foreground font-medium border-l-[3px] border-sidebar-primary rounded-l-none";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { canManageUsers } = usePermissions();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* System name */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          {collapsed ? (
            <div className="flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-sidebar-primary" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-6 w-6 text-sidebar-primary" strokeWidth={1.5} />
              <span className="text-base font-semibold text-sidebar-foreground tracking-tight">Gestão de Projetos</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-sidebar-foreground/40 font-medium px-4 mb-1">
            Visão Geral
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" end className={navItemClass} activeClassName={activeNavItemClass}>
                    <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/meu-trabalho" end className={navItemClass} activeClassName={activeNavItemClass}>
                    <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">Meu Trabalho</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-sidebar-foreground/40 font-medium px-4 mb-1">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end className={navItemClass} activeClassName={activeNavItemClass}>
                    <FolderOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">Projetos</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canManageUsers && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-sidebar-foreground/40 font-medium px-4 mb-1">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/usuarios" end className={navItemClass} activeClassName={activeNavItemClass}>
                      <Users className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      {!collapsed && <span className="text-sm">Usuários</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
