import { SimpleMapView } from '../components/SimpleMapView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, MapPin, Info, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useMpa } from '../contexts/MpaContext';
import { useAuth } from '../contexts/AuthContext';

export default function PublicMapViewerPage() {
  const navigate = useNavigate();
  const { activeMpas, getNotificationsForUser, markNotificationsRead } =
    useMpa();
  const { user, isStaff } = useAuth();

  const staffNotifs = user ? getNotificationsForUser(user.id) : [];
  const unread = staffNotifs.filter((n) => !n.read);

  const typeLabel = (type: string) =>
    type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const typeColor = (type: string) => {
    switch (type) {
      case 'core':
        return 'text-blue-600';
      case 'buffer':
        return 'text-teal-600';
      case 'multiple-use':
        return 'text-green-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Map Viewer</h2>
        <p className="text-gray-600 mt-1">Explore marine protected areas and conservation zones</p>
      </div>

      {isStaff && unread.length > 0 && user && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-900 font-medium">
            <Bell className="h-4 w-4" />
            MPA request updates
          </div>
          {unread.map((n) => (
            <p key={n.id} className="text-sm text-green-800">
              {n.message}
            </p>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="border-green-300"
            onClick={() => markNotificationsRead(user.id)}
          >
            Mark as read
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] relative rounded-lg overflow-hidden">
            <SimpleMapView />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-green-400" onClick={() => navigate('/dashboard/report-issue')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Report an Issue
            </CardTitle>
            <CardDescription>
              See something concerning? Report environmental issues in the protected areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Create Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Map Information
            </CardTitle>
            <CardDescription>
              Understanding the marine protected areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded bg-blue-500 mt-0.5 flex-shrink-0"></div>
                <span><strong>Core Protection:</strong> No-take zones with strict conservation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded bg-teal-500 mt-0.5 flex-shrink-0"></div>
                <span><strong>Buffer Zone:</strong> Limited activities allowed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protected Areas</CardTitle>
          <CardDescription>
            Active marine protected areas in Puerto Princesa ({activeMpas.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeMpas.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-6">
                No active MPAs on the map yet.
              </p>
            ) : (
              activeMpas.map((mpa) => (
                <div
                  key={mpa.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className={`h-5 w-5 shrink-0 ${typeColor(mpa.type)}`} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{mpa.name}</p>
                      <p className="text-sm text-gray-600">
                        {mpa.barangay} · {mpa.area.toFixed(1)} ha
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 capitalize ${typeColor(mpa.type)}`}>
                    {typeLabel(mpa.type)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
