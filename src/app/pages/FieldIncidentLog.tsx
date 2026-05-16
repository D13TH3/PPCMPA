import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield, Camera, MapPin, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function FieldIncidentLog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    violationType: '',
    severity: '',
    suspects: '',
    evidence: '',
    location: '',
    notes: '',
  });

  const violationTypes = [
    'Illegal Fishing - Dynamite',
    'Illegal Fishing - Cyanide',
    'Illegal Fishing - Trawling',
    'Unauthorized Entry',
    'Coral Destruction',
    'Marine Pollution',
    'Wildlife Poaching',
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentId = `INC-${Date.now()}`;
    toast.success('Incident logged successfully', {
      description: `Case ID: ${incidentId}`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-3">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Field Incident Log</h2>
            <p className="text-gray-600">Staff: {user?.name}</p>
          </div>
        </div>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident Report</CardTitle>
            <CardDescription>Document enforcement activities and violations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="violation">Violation Type *</Label>
                  <Select
                    value={formData.violationType}
                    onValueChange={(v) => setFormData({ ...formData, violationType: v })}
                  >
                    <SelectTrigger id="violation">
                      <SelectValue placeholder="Select violation" />
                    </SelectTrigger>
                    <SelectContent>
                      {violationTypes.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData({ ...formData, severity: v })}
                  >
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suspects">Suspects / Involved Parties</Label>
                <Input
                  id="suspects"
                  value={formData.suspects}
                  onChange={(e) => setFormData({ ...formData, suspects: e.target.value })}
                  placeholder="Names, vessel information, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="GPS coordinates or area name"
                  />
                  <Button type="button" size="icon" variant="outline">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence Collected</Label>
                <Textarea
                  id="evidence"
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  placeholder="Description of evidence, items confiscated..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Staff Notes *</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detailed description of the incident..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Attach Evidence Photos</Label>
                <Button type="button" variant="outline" className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  Upload Photos / Documents
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save Incident Report
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
