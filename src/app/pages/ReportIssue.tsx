import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SimpleMapView } from '../components/SimpleMapView';
import { AlertCircle, Camera, MapPin, Send, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
  });

  const categories = [
    'Illegal Fishing',
    'Coral Damage',
    'Marine Pollution',
    'Wildlife Disturbance',
    'Other Environmental Issue',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save report to localStorage
    const reports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    const newReport = {
      id: `RPT-${Date.now()}`,
      ...formData,
      status: 'Submitted',
      verificationStatus: 'new',
      submittedBy: user?.name || 'Anonymous',
      submittedAt: new Date().toISOString(),
    };
    reports.push(newReport);
    localStorage.setItem('citizen_reports', JSON.stringify(reports));

    toast.success('Report submitted successfully', {
      description: `Tracking ID: ${newReport.id}`,
    });

    // Clear form
    setFormData({
      category: '',
      title: '',
      description: '',
      location: '',
    });

    // Navigate to My Reports
    navigate('/dashboard/my-reports');
  };

  return (
    <div className="relative z-10 w-full">
      <div className="mx-auto max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/map-viewer')}
            className="mb-3 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Map Viewer
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Report Environmental Issue</h1>
          <p className="mt-2 text-gray-600">Help protect our marine areas by reporting concerns</p>
        </div>

        {/* Info Alert */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Important Information</p>
              <p className="mt-1 text-sm text-blue-800">
                Your report will be reviewed by administrators and forwarded to the appropriate office.
                You can track the status of your submission under "My Reports".
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Form and Map */}
        <div className="grid gap-6 lg:grid-cols-2">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Provide information about the environmental concern</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">
                  Issue Type *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                  required
                >
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Illegal fishing nets spotted near coral reef"
                  required
                  className="h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about what you observed, when it happened, and any other relevant details..."
                  rows={6}
                  required
                  className="resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium">
                  Location
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Near Tubbataha Reef, coordinates from map"
                    className="h-11"
                  />
                  <Button type="button" size="icon" variant="outline" className="h-11 w-11">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Click the map on the right to select a location</p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Attach Photos (Optional)
                </Label>
                <Button type="button" variant="outline" className="w-full gap-2 h-11">
                  <Camera className="h-4 w-4" />
                  Upload Photos (1-3 files)
                </Button>
                <p className="text-xs text-gray-500">Supported formats: JPG, PNG (max 5MB each)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1 gap-2 h-12 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-5 w-5" />
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="sm:w-32 h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

          {/* Map Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Select Location on Map
              </CardTitle>
              <CardDescription>Click on the map to mark the issue location (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-100">
                <SimpleMapView />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">How to use the map:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Click on the map to select the location of the issue</li>
                  <li>• Zoom in/out for better precision</li>
                  <li>• The coordinates will be added to the location field</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Sticky Submit Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
            className="w-full gap-2 h-12 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-5 w-5" />
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
