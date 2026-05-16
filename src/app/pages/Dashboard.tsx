import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
  MapPin,
  TrendingUp,
  Shield,
  AlertCircle,
  Waves,
  Fish,
  Trees,
  Leaf,
  Map as MapIcon,
  FileText,
  Users,
  Settings,
  CheckCircle,
  BarChart3,
  ScrollText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockMPAs, mockEffectivenessData } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { useMpa } from "../contexts/MpaContext";
import { useNavigate } from "react-router";
import { SimpleMapView } from "../components/SimpleMapView";
import { PenTool, Eye, Bell } from "lucide-react";

export function Dashboard() {
  const { user, isSystemAdmin } = useAuth();
  const { getUnreadNotificationsCount, boundaryRequests } = useMpa();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ROLE-BASED RENDERING
  // Public users see welcome dashboard with action cards
  if (user?.role === 'public') {
    // Get citizen reports from localStorage
    const reports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    const userReports = reports.filter((r: any) => r.submittedBy === user.name);
    const pendingReports = userReports.filter((r: any) => r.status === 'Submitted');

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {user.name}</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Help protect our marine environment
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reports</CardDescription>
              <CardTitle className="text-3xl">{userReports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Your submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingReports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Protected Areas</CardDescription>
              <CardTitle className="text-3xl text-blue-600">6</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Total MPAs</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="transition-all hover:shadow-lg hover:border-blue-400">
            <CardHeader>
              <MapIcon className="h-10 w-10 text-blue-600 mb-3" />
              <CardTitle>View Map</CardTitle>
              <CardDescription>Explore marine protected areas and their boundaries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/map-viewer')}
                className="w-full gap-2"
              >
                <MapIcon className="h-4 w-4" />
                Open Map Viewer
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-green-400">
            <CardHeader>
              <AlertCircle className="h-10 w-10 text-green-600 mb-3" />
              <CardTitle>Report Environmental Issue</CardTitle>
              <CardDescription>Submit a new report about marine conservation concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/report-issue')}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <AlertCircle className="h-4 w-4" />
                Create Report
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-teal-400">
            <CardHeader>
              <FileText className="h-10 w-10 text-teal-600 mb-3" />
              <CardTitle>My Reports</CardTitle>
              <CardDescription>Track your submitted reports and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/my-reports')}
                variant="outline"
                className="w-full gap-2"
              >
                <FileText className="h-4 w-4" />
                View My Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-3" />
              <CardTitle>How to Report</CardTitle>
              <CardDescription>Guidelines for submitting environmental reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Include specific location details</li>
                <li>• Provide photos if available</li>
                <li>• Describe the issue clearly</li>
                <li>• Select the appropriate category</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // System Admin users see system administration tools
  if (user?.role === 'system_admin') {
    // Get data from localStorage for system stats
    const allUsers = JSON.parse(localStorage.getItem('mpa_user') || 'null');
    const auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const citizenReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    const fieldIncidents = JSON.parse(localStorage.getItem('field_incidents') || '[]');

    // Calculate system statistics
    const totalUsers = 4; // From mock data
    const systemHealthScore = 98; // System health percentage
    const activeModules = 12;
    const recentLogins = auditLogs.filter((log: any) => log.action === 'login').length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">System Administration Dashboard</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Monitor system health, manage users, and configure system settings
          </p>
        </div>

        {/* System Health Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>System Health</CardDescription>
              <CardTitle className="text-3xl text-green-600">{systemHealthScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={systemHealthScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Modules</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{activeModules}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Running normally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Recent Logins</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">{recentLogins}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-purple-400" onClick={() => navigate('/dashboard/user-management')}>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>Add, edit, or remove user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-400" onClick={() => navigate('/dashboard/system-settings')}>
            <CardHeader>
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system parameters and global settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configure System
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-indigo-400" onClick={() => navigate('/dashboard/audit-logs')}>
            <CardHeader>
              <FileText className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Monitor system activity, logins, and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Overview Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Status Overview</CardTitle>
              <CardDescription>Current system status and component health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <Badge className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">API Server</span>
                <Badge className="bg-green-500">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Authentication Service</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Map Service</span>
                <Badge className="bg-green-500">Running</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Summary</CardTitle>
              <CardDescription>System activity from the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-semibold text-gray-900">{citizenReports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Field Incidents</span>
                  <span className="font-semibold text-gray-900">{fieldIncidents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User Logins</span>
                  <span className="font-semibold text-gray-900">{recentLogins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="font-semibold text-gray-900">99.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin users see admin tools
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Administration</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage approvals, analytics, and ordinances
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate('/dashboard/admin-approvals')}>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Approvals</CardTitle>
              <CardDescription>Review and approve boundary requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">0 Pending</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate('/dashboard/reports')}>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View system analytics and reports</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate('/dashboard/ordinances')}>
            <CardHeader>
              <ScrollText className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Ordinances</CardTitle>
              <CardDescription>Manage MPA ordinances</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Staff users see field tools
  if (user?.role === 'staff') {
    // Get reports from localStorage
    const citizenReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    const fieldIncidents = JSON.parse(localStorage.getItem('field_incidents') || '[]');

    // Calculate statistics
    const newReports = citizenReports.filter((r: any) => r.verificationStatus === 'new' || !r.verificationStatus);
    const underReview = citizenReports.filter((r: any) => r.verificationStatus === 'under_review');
    const totalReports = citizenReports.length;
    const totalIncidents = fieldIncidents.length;
    const staffNotifCount = getUnreadNotificationsCount(user.id);
    const myPendingBoundaryRequests = boundaryRequests.filter(
      (r) => r.submittedBy === user.id && r.status === 'pending',
    ).length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Dashboard</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Field operations and enforcement tools
          </p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reports</CardDescription>
              <CardTitle className="text-3xl">{totalReports}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Public submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Needs Review</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{newReports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Under Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{underReview.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Field Incidents</CardDescription>
              <CardTitle className="text-3xl text-red-600">{totalIncidents}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Logged by staff</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-lg hover:border-indigo-400">
            <CardHeader>
              <PenTool className="h-10 w-10 text-indigo-600 mb-3" />
              <CardTitle>Map Editor</CardTitle>
              <CardDescription>
                Draw and edit MPA boundaries, then send requests for admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/map')}
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-teal-600"
              >
                <PenTool className="h-4 w-4" />
                Open Map Editor
              </Button>
              {myPendingBoundaryRequests > 0 && (
                <Badge className="mt-2 w-full justify-center bg-amber-100 text-amber-800">
                  {myPendingBoundaryRequests} pending approval
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-teal-400">
            <CardHeader>
              <Eye className="h-10 w-10 text-teal-600 mb-3" />
              <CardTitle>Map Viewer</CardTitle>
              <CardDescription>
                View approved MPAs and check boundary request updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/map-viewer')}
                variant="outline"
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                Open Map Viewer
              </Button>
              {staffNotifCount > 0 && (
                <Badge className="mt-2 w-full justify-center gap-1 bg-green-100 text-green-800">
                  <Bell className="h-3 w-3" />
                  {staffNotifCount} new update{staffNotifCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-blue-400">
            <CardHeader>
              <AlertCircle className="h-10 w-10 text-blue-600 mb-3" />
              <CardTitle>Incoming Reports</CardTitle>
              <CardDescription>Review and verify public submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/incoming-reports')}
                className="w-full gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Review Reports
              </Button>
              {newReports.length > 0 && (
                <Badge className="mt-2 w-full justify-center bg-blue-100 text-blue-800">
                  {newReports.length} New
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-red-400">
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-3" />
              <CardTitle>Field Incident Log</CardTitle>
              <CardDescription>Document violations and patrol findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/field-incident-log')}
                className="w-full gap-2 bg-red-600 hover:bg-red-700"
              >
                <Shield className="h-4 w-4" />
                Create New Log
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:border-green-400">
            <CardHeader>
              <Trees className="h-10 w-10 text-green-600 mb-3" />
              <CardTitle>Ecosystem Inventory</CardTitle>
              <CardDescription>View ecosystem data and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/ecosystem')}
                variant="outline"
                className="w-full gap-2"
              >
                <Trees className="h-4 w-4" />
                View Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin users see full analytics dashboard (default below)
  // This is the existing dashboard code
  // Calculate aggregate statistics
  const totalArea = mockMPAs.reduce((sum, mpa) => sum + mpa.area, 0);
  const totalMangrove = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.mangrove, 0);
  const totalSeagrass = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.seagrass, 0);
  const totalCoralReef = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.coralReef, 0);
  
  const avgEffectiveness = mockEffectivenessData.reduce((sum, data) => sum + data.overall, 0) / mockEffectivenessData.length;

  // Data for MPA type distribution
  const mpaTypeData = [
    { name: 'Core', value: mockMPAs.filter(m => m.type === 'core').length, color: '#0ea5e9', id: 'type-core' },
    { name: 'Buffer', value: mockMPAs.filter(m => m.type === 'buffer').length, color: '#14b8a6', id: 'type-buffer' },
    { name: 'Multi-Use', value: mockMPAs.filter(m => m.type === 'multiple-use').length, color: '#22c55e', id: 'type-multi' },
    { name: 'Fishery', value: mockMPAs.filter(m => m.type === 'fishery-reserve').length, color: '#eab308', id: 'type-fishery' },
  ];

  // Ecosystem composition data
  const ecosystemData = [
    { habitat: 'Mangrove', area: totalMangrove, color: '#16a34a', id: 'eco-mangrove' },
    { habitat: 'Seagrass', area: totalSeagrass, color: '#14b8a6', id: 'eco-seagrass' },
    { habitat: 'Coral Reef', area: totalCoralReef, color: '#f97316', id: 'eco-coral' },
  ];

  // Effectiveness by MPA
  const effectivenessChartData = mockEffectivenessData.map(item => ({
    name: item.mpaName.split(' ')[0],
    score: item.overall
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          MPA Management Dashboard
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Real-time overview of Puerto Princesa's Marine Protected Areas
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription>Total Protected Area</CardDescription>
            <CardTitle className="text-3xl">{totalArea.toFixed(1)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <MapPin className="w-4 h-4" />
              <span>6 Active MPAs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardHeader className="pb-3">
            <CardDescription>Avg Effectiveness</CardDescription>
            <CardTitle className="text-3xl">{avgEffectiveness.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-teal-600">
              <TrendingUp className="w-4 h-4" />
              <span>+3.2% from Q3 2025</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription>Ecosystem Coverage</CardDescription>
            <CardTitle className="text-3xl">{(totalMangrove + totalSeagrass + totalCoralReef).toFixed(0)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Trees className="w-4 h-4" />
              <span>3 Habitat Types</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardHeader className="pb-3">
            <CardDescription>Compliance Status</CardDescription>
            <CardTitle className="text-3xl">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Shield className="w-4 h-4" />
              <span>All ordinances active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MPA Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Management Effectiveness by MPA</CardTitle>
            <CardDescription>Q4 2025 Performance Scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effectivenessChartData}>
                <CartesianGrid strokeDasharray="3 3" key="grid-effectiveness" />
                <XAxis dataKey="name" key="xaxis-effectiveness" />
                <YAxis domain={[0, 100]} key="yaxis-effectiveness" />
                <Tooltip key="tooltip-effectiveness" />
                <Bar dataKey="score" fill="#0ea5e9" radius={[8, 8, 0, 0]} key="bar-effectiveness" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MPA Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>MPA Type Distribution</CardTitle>
            <CardDescription>Classification of Protected Areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mpaTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mpaTypeData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ecosystem Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Habitat Coverage</CardTitle>
          <CardDescription>Protected ecosystem areas across all MPAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ecosystemData.map((ecosystem) => (
              <div key={ecosystem.habitat} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ecosystem.habitat === 'Mangrove' && <Trees className="w-4 h-4 text-green-600" />}
                    {ecosystem.habitat === 'Seagrass' && <Leaf className="w-4 h-4 text-teal-600" />}
                    {ecosystem.habitat === 'Coral Reef' && <Waves className="w-4 h-4 text-orange-600" />}
                    <span className="font-medium">{ecosystem.habitat}</span>
                  </div>
                  <span className="font-bold" style={{ color: ecosystem.color }}>
                    {ecosystem.area.toFixed(1)} ha
                  </span>
                </div>
                <Progress 
                  value={(ecosystem.area / totalArea) * 100} 
                  className="h-3"
                  style={{ 
                    backgroundColor: `${ecosystem.color}20`,
                  }}
                />
                <p className="text-xs text-gray-500">
                  {((ecosystem.area / totalArea) * 100).toFixed(1)}% of total protected area
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent MPAs */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Updated MPAs</CardTitle>
          <CardDescription>Latest changes and additions to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMPAs.slice(0, 3).map((mpa) => (
              <div key={mpa.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{mpa.name}</h4>
                    <Badge 
                      variant={mpa.type === 'core' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {mpa.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {mpa.barangay} • {mpa.area} hectares • {mpa.ordinanceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Active</p>
                  <p className="text-xs text-gray-500">{mpa.dateEstablished}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Banner */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">System Update Available</h4>
              <p className="text-sm text-amber-800 mt-1">
                New ordinances from Q1 2026 are pending digitization. Visit the Ordinances page to review and map new boundaries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}