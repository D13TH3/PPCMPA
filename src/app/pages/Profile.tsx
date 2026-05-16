import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Mail, Briefcase, Camera, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const { user, updateProfile, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (!user) {
    return null;
  }

  const handleSave = () => {
    updateProfile({ name });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setName(user.name);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = () => {
    return user.role === 'admin' 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
  };

  const rolePermissions =
    user.role === 'admin'
      ? [
          'Full access to Map Editor',
          'Create and edit Ordinances',
          'Manage all MPA boundaries (publish immediately)',
          'Review staff boundary requests',
          'Export and generate reports',
          'View all system data',
          'Edit ecosystem inventory',
        ]
      : user.role === 'staff'
        ? [
            'Full Map Editor (draw, edit shapes, import ordinance polygons)',
            'Send boundary create/update/delete requests to admin',
            'Map Viewer for approved MPAs and request notifications',
            'Review citizen reports and field incident logging',
            'View Ecosystem Inventory and Management Effectiveness',
          ]
        : [
            'View Dashboard statistics',
            'View Ecosystem Inventory',
            'View Management Effectiveness',
            'View and export Reports',
            'Limited editing permissions',
          ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-teal-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => toast.info('Image upload coming soon!')}
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-4 text-center">{user.name}</h3>
            <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
              <Shield className="w-3 h-3 inline mr-1" />
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="role"
                  type="text"
                  value={user.role === 'admin' ? 'Administrator' : 'User'}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500">Role is assigned by system administrator</p>
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Your {user.role === 'admin' ? 'administrator' : 'user'} role grants you the following permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rolePermissions.map((permission, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                    user.role === 'admin' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                  <span className="text-sm text-gray-700">{permission}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Stats Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Your recent activity in the MPA system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{isAdmin ? '24' : '8'}</p>
                <p className="text-sm text-gray-600 mt-1">{isAdmin ? 'Map Edits' : 'Data Views'}</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <p className="text-3xl font-bold text-teal-600">12</p>
                <p className="text-sm text-gray-600 mt-1">Reports Generated</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600 mt-1">Days Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}