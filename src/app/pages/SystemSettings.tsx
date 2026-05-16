import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Settings, Save } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-3">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input defaultValue="Puerto Princesa MPA System" />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input defaultValue="mpa@puertoprincesampa.gov" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Email Verification</p>
                  <p className="text-sm text-gray-600">New users must verify email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Enable 2FA for all users</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Access Settings</CardTitle>
              <CardDescription>Configure public user features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Public Map Access</p>
                  <p className="text-sm text-gray-600">Non-authenticated users can view map</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Issue Reporting</p>
                  <p className="text-sm text-gray-600">Allow logged-in public users to report</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
