import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Map,
  Sprout,
  BarChart3,
  FileText,
  ScrollText,
  Waves,
  LogIn,
  LogOut,
  User as UserIcon,
  Database,
  CheckCircle,
  Eye,
  AlertCircle,
  Shield,
  Users,
  Settings,
  Menu,
  Info,
  Inbox
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useMpa } from "../contexts/MpaContext";
import { useNavigate } from "react-router";
import { useState } from "react";

export function RootLayout() {
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isStaff, isSystemAdmin } = useAuth();
  const { getPendingRequestsCount } = useData();
  const { getPendingMpaRequestsCount, getUnreadNotificationsCount, activeMpas } =
    useMpa();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = getPendingRequestsCount();
  const pendingMpaCount = getPendingMpaRequestsCount();
  const staffNotifCount = user ? getUnreadNotificationsCount(user.id) : 0;
  const totalProtectedArea = activeMpas
    .reduce((sum, m) => sum + m.area, 0)
    .toFixed(1);

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: "Core",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'staff', 'public'] },
        { path: "/dashboard/map-viewer", label: "Map Viewer", icon: Eye, roles: ['public', 'staff', 'admin'] },
      ],
    },
    {
      title: "Public",
      items: [
        { path: "/dashboard/report-issue", label: "Report Issue", icon: AlertCircle, roles: ['public'] },
        { path: "/dashboard/my-reports", label: "My Reports", icon: FileText, roles: ['public'] },
        { path: "/dashboard/information-hub", label: "Information Hub", icon: Info, roles: ['public'] },
      ],
    },
    {
      title: "Field Staff",
      items: [
        { path: "/dashboard/incoming-reports", label: "Incoming Reports", icon: Inbox, roles: ['staff'] },
        { path: "/dashboard/field-incident-log", label: "Field Incident Log", icon: Shield, roles: ['staff'] },
        { path: "/dashboard/map", label: "Map Editor", icon: Map, roles: ['admin', 'staff'] },
        { path: "/dashboard/ecosystem", label: "Ecosystem", icon: Sprout, roles: ['admin', 'staff'] },
        { path: "/dashboard/effectiveness", label: "Effectiveness", icon: BarChart3, roles: ['admin', 'staff'] },
      ],
    },
    {
      title: "Administration",
      items: [
        { path: "/dashboard/admin-approvals", label: "Approvals", icon: CheckCircle, roles: ['admin'], hasBadge: true },
        { path: "/dashboard/reports", label: "Analytics & Reports", icon: FileText, roles: ['admin'] },
        { path: "/dashboard/ordinances", label: "Ordinances", icon: ScrollText, roles: ['admin'] },
      ],
    },
    {
      title: "System Administration",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['system_admin'] },
        { path: "/dashboard/user-management", label: "User Management", icon: Users, roles: ['system_admin'] },
        { path: "/dashboard/system-settings", label: "System Settings", icon: Settings, roles: ['system_admin'] },
        { path: "/dashboard/audit-logs", label: "Audit Logs", icon: FileText, roles: ['system_admin'] },
      ],
    },
  ];

  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => user && item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  const approvalBadgeCount = pendingCount + (isAdmin ? pendingMpaCount : 0);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  type NavItem = {
    path: string;
    label: string;
    icon: typeof LayoutDashboard;
    roles: string[];
    hasBadge?: boolean;
    staffNotifBadge?: boolean;
  };

  // Reusable navigation menu component
  const NavigationMenu = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="space-y-6">
      {filteredNavSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const badgeCount = item.hasBadge
                ? approvalBadgeCount
                : item.staffNotifBadge
                ? staffNotifCount
                : 0;
              return (
                <Link key={item.path} to={item.path} onClick={onItemClick}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start relative ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {badgeCount > 0 && (
                      <Badge className="ml-auto bg-yellow-500 text-white">
                        {badgeCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-2 rounded-lg">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Puerto Princesa MPA System
                </h1>
                <p className="text-sm text-gray-600">
                  Dynamic Management & Spatial Information Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Login Button */}
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}

              {/* User Profile */}
              {isAuthenticated && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600">{user.role}</p>
                          {staffNotifCount > 0 && (
                            <Badge className="bg-green-500 text-white text-[10px] uppercase px-2 py-1">
                              {staffNotifCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Avatar className="w-10 h-10 border-2 border-gray-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <span className="text-sm text-gray-600">Last Updated: March 20, 2026</span>
            </div>
          </div>
        </div>

        {/* Mobile Header - Simplified */}
        <div className="lg:hidden px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Access system features and reports</SheetDescription>
                </SheetHeader>

                {/* User Info in Mobile Menu */}
                {isAuthenticated && user && (
                  <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-teal-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-blue-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <NavigationMenu onItemClick={() => setMobileMenuOpen(false)} />
                </div>

                {/* Quick Stats in Mobile Menu */}
                <div className="p-4 mt-6 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Total MPAs</p>
                      <p className="text-2xl font-bold text-blue-600">{activeMpas.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Protected Area</p>
                      <p className="text-2xl font-bold text-teal-600">{totalProtectedArea} ha</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-amber-600">{approvalBadgeCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Active Ordinances</p>
                      <p className="text-2xl font-bold text-green-600">7</p>
                    </div>
                  </div>
                </div>

                {/* Sign Out in Mobile Menu */}
                {isAuthenticated && (
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full gap-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Center: Logo + Short Title */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-1.5 rounded-lg">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-bold text-gray-900">PP MPA</h1>
            </div>

            {/* Right: Profile Icon Only */}
            {isAuthenticated && user ? (
              <Avatar className="w-9 h-9 border-2 border-gray-200">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-teal-600 text-white text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation - Desktop Only */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-81px)] sticky top-[81px]">
          <div className="p-4">
            <NavigationMenu />
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 mt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Total MPAs</p>
                <p className="text-2xl font-bold text-blue-600">{activeMpas.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Protected Area</p>
                <p className="text-2xl font-bold text-teal-600">{totalProtectedArea} ha</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600">{approvalBadgeCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Ordinances</p>
                <p className="text-2xl font-bold text-green-600">7</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}