import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, FileText } from 'lucide-react';
import { useState } from 'react';

const mockLogs = [
  { id: '1', user: 'admin@puertoprincesampa.gov', action: 'User Login', timestamp: '2026-05-01 14:30:22', status: 'Success' },
  { id: '2', user: 'staff@puertoprincesampa.gov', action: 'Incident Log Created', timestamp: '2026-05-01 14:25:15', status: 'Success' },
  { id: '3', user: 'public@example.com', action: 'Report Submitted', timestamp: '2026-05-01 14:20:08', status: 'Success' },
  { id: '4', user: 'unknown', action: 'Failed Login Attempt', timestamp: '2026-05-01 14:15:33', status: 'Failed' },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">System activity and security monitoring</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search logs by user or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-semibold">Timestamp</th>
                    <th className="pb-3 text-left font-semibold">User</th>
                    <th className="pb-3 text-left font-semibold">Action</th>
                    <th className="pb-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-4 font-mono text-sm text-gray-600">{log.timestamp}</td>
                      <td className="py-4">{log.user}</td>
                      <td className="py-4 font-medium">{log.action}</td>
                      <td className="py-4">
                        <Badge className={log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
