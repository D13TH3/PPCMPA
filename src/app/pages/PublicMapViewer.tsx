import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { SimpleMapView } from '../components/SimpleMapView';
import { Info, LogIn, AlertCircle, Waves, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';

export default function PublicMapViewer() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/report-issue');
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      system_admin: { label: 'System Admin', className: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
      staff: { label: 'Staff', className: 'bg-blue-100 text-blue-800' },
      public: { label: 'Public', className: 'bg-gray-100 text-gray-800' },
    };
    return badges[role] || badges.public;
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* Fixed Top Navigation Bar */}
      <header className="z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-teal-600 p-2">
              <Waves className="h-5 w-5 text-white md:h-6 md:w-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900 md:text-base">
                Puerto Princesa MPA Management System
              </h1>
              <p className="text-xs text-gray-600">Marine Protected Areas</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-gray-900">Puerto Princesa MPA</h1>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* About System Button */}
            <Button
              onClick={() => setShowInfo(true)}
              variant="outline"
              size="sm"
              className="gap-1 md:gap-2"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">About System</span>
            </Button>

            {/* Login Button (Not Authenticated) */}
            {!isAuthenticated && (
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="gap-1 bg-blue-600 hover:bg-blue-700 md:gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login / Sign Up</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}

            {/* User Profile (Authenticated) */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Role Badge */}
                <Badge className={`hidden md:inline-flex ${getRoleBadge(user.role).className}`}>
                  {getRoleBadge(user.role).label}
                </Badge>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-100 md:gap-3 md:p-2">
                      <div className="hidden text-right md:block">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{getRoleBadge(user.role).label}</p>
                      </div>
                      <Avatar className="h-8 w-8 border-2 border-gray-200 md:h-10 md:w-10">
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
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen Map Below Header */}
      <div className="relative flex-1">
        <SimpleMapView />

        {/* Floating Action Button (Logged-in Public Users Only) */}
        {isAuthenticated && user?.role === 'public' && (
          <div className="absolute bottom-6 right-6 z-20 md:bottom-8 md:right-8">
            <Button
              onClick={handleReportClick}
              className="gap-2 rounded-full bg-blue-600 px-4 py-6 shadow-lg hover:bg-blue-700 md:px-6"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Report Issue</span>
            </Button>
          </div>
        )}

        {/* Disabled Report Button (Not Logged In) */}
        {!isAuthenticated && (
          <div className="absolute bottom-6 right-6 z-20 md:bottom-8 md:right-8">
            <Button
              onClick={handleReportClick}
              disabled
              className="gap-2 rounded-full bg-gray-300 px-4 py-6 text-gray-500 shadow-lg md:px-6"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Report Issue</span>
            </Button>
          </div>
        )}
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">About This System</DialogTitle>
            <DialogDescription>
              Puerto Princesa Marine Protected Area Dynamic Management Platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Purpose</h3>
              <p className="text-sm text-gray-700">
                This Web-GIS platform provides real-time spatial information and dynamic management tools
                for Puerto Princesa's marine protected areas. The system supports conservation efforts,
                enforcement operations, and community engagement.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Features</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Interactive map of all marine protected areas</li>
                <li>• Real-time ecosystem monitoring data</li>
                <li>• Management effectiveness tracking</li>
                <li>• Community reporting tools (login required)</li>
                <li>• Enforcement field logging (officers only)</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Get Involved</h3>
              <p className="text-sm text-gray-700">
                Registered users can report environmental issues and track their submissions.
                Sign in or create an account to access reporting features.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>For Official Use:</strong> Government officers and administrators should sign in
                using their official @puertoprincesampa.gov email addresses.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to report environmental issues and track submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700">
              Create a free account or sign in to access:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                <span>Report environmental issues with location and photos</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                <span>Track status of your submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                <span>Receive updates on reported issues</span>
              </li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => navigate('/login')}>
              Sign In / Sign Up
            </Button>
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
