import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Calendar, MapPin, FileText, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Report {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  verificationStatus?: 'new' | 'under_review' | 'verified' | 'flagged' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  staffNotes?: string;
  adminNotes?: string;
}

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    setReports(stored);
  }, []);

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Verified':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'Approved':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'Rejected':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'Flagged':
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (verificationStatus?: string) => {
    switch (verificationStatus) {
      case 'new':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'verified':
        return 'Verified by Staff';
      case 'flagged':
        return 'Flagged';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Submitted';
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Reports</h2>
            <p className="mt-1 text-gray-600">Track your submitted environmental reports</p>
          </div>
          <Button onClick={() => navigate('/dashboard/report-issue')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 font-semibold text-gray-900">No reports found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Submit your first environmental report'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/dashboard/report-issue')} className="mt-4">
                Create Report
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">{report.category}</Badge>
                        <Badge className={getStatusColor(report.verificationStatus || 'new')}>
                          {getStatusLabel(report.verificationStatus)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{report.title}</CardTitle>
                    </div>
                    <span className="text-sm font-mono text-gray-500">{report.id}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-700">{report.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {report.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(report.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Staff Notes */}
                  {report.staffNotes && (
                    <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">STAFF NOTES</p>
                      <p className="text-sm text-blue-900">{report.staffNotes}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {report.adminNotes && (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">ADMIN NOTES</p>
                      <p className="text-sm text-gray-900">{report.adminNotes}</p>
                    </div>
                  )}

                  {/* Status Information */}
                  {(report.verificationStatus === 'verified' || report.verificationStatus === 'under_review') && (
                    <div className="mt-3 text-xs text-gray-600">
                      <p>Your report has been reviewed by staff and is awaiting admin approval.</p>
                    </div>
                  )}
                  {report.verificationStatus === 'approved' && (
                    <div className="mt-3 text-xs text-emerald-700 font-medium">
                      ✓ Your report has been approved and will be processed accordingly.
                    </div>
                  )}
                  {report.verificationStatus === 'rejected' && (
                    <div className="mt-3 text-xs text-red-700 font-medium">
                      ✗ Your report was not approved. Please review the admin notes above.
                    </div>
                  )}
                  {report.verificationStatus === 'flagged' && (
                    <div className="mt-3 text-xs text-orange-700 font-medium">
                      ⚠ Your report was flagged during review. Please review the staff notes above.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
