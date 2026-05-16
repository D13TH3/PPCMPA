import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Current Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
            <p className="text-sm text-amber-800 mt-2">
              This page requires administrator privileges. Please contact your system administrator if you believe you should have access.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
