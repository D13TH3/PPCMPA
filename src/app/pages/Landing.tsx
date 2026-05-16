import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Map, Shield, Users, BarChart3, FileText, Eye } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Map className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900">MPA Monitoring</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Puerto Princesa Marine Protected Area
            <br />
            Monitoring System
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            A comprehensive platform for environmental protection, marine ecosystem mapping,
            citizen reporting, and local government monitoring of protected marine areas.
          </p>

          {/* Primary Actions */}
          <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => navigate('/view-map')}>
              <Eye className="h-5 w-5" />
              View Map (Guest Mode)
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/login')}>
              <Shield className="h-5 w-5" />
              Log In
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/signup')}>
              <Users className="h-5 w-5" />
              Sign Up
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Interactive Mapping</CardTitle>
              <CardDescription>
                Explore marine protected areas with detailed boundaries, zones, and environmental data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Citizen Reporting</CardTitle>
              <CardDescription>
                Report environmental issues like illegal fishing, pollution, and wildlife disturbance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Track compliance, monitor ecosystem health, and analyze environmental trends
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Multi-Role Access</CardTitle>
              <CardDescription>
                Role-based dashboards for public users, field staff, administrators, and system managers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* System Roles */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">System Access Levels</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  Guest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• View map (read-only)</li>
                  <li>• Browse protected areas</li>
                  <li>• No reporting access</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Public User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Full map access</li>
                  <li>• Submit issue reports</li>
                  <li>• Track report status</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Field incident logging</li>
                  <li>• Data submission</li>
                  <li>• Ecosystem monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Analytics dashboard</li>
                  <li>• Approve data requests</li>
                  <li>• Generate reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-600">
          <p>Puerto Princesa City Local Government Unit - Environment and Natural Resources Office</p>
          <p className="mt-2">Marine Protected Area Monitoring and Management System</p>
        </div>
      </footer>
    </div>
  );
}
