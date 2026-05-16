import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Users, Search, Plus, Shield, Pencil, Trash2 } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'Administrator', email: 'admin@puertoprincesampa.gov', role: 'admin', status: 'Active' },
  { id: '2', name: 'Dr. Maria Santos', email: 'admin@puertoprincesampa.gov', role: 'admin', status: 'Active' },
  { id: '3', name: 'Carlos Rivera', email: 'staff@puertoprincesampa.gov', role: 'staff', status: 'Active' },
  { id: '4', name: 'Maria Clara', email: 'public@example.com', role: 'public', status: 'Active' },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      staff: 'bg-green-100 text-green-800',
      public: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.public;
  };

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage system users and permissions</p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-semibold">Name</th>
                    <th className="pb-3 text-left font-semibold">Email</th>
                    <th className="pb-3 text-left font-semibold">Role</th>
                    <th className="pb-3 text-left font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-4 font-medium">{user.name}</td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4">
                        <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{mockUsers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{mockUsers.filter((u) => u.status === 'Active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{mockUsers.filter((u) => u.role === 'staff').length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
