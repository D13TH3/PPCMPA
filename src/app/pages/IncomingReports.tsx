import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
  staffNotes?: string;
  verificationStatus?: 'new' | 'under_review' | 'verified' | 'flagged';
}

export default function IncomingReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'valid' | 'invalid' | 'review' | null>(null);
  const [staffNotes, setStaffNotes] = useState('');

  // Load reports from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    // Add verification status if not present
    const reportsWithStatus = stored.map((r: Report) => ({
      ...r,
      verificationStatus: r.verificationStatus || 'new'
    }));
    setReports(reportsWithStatus);
    setFilteredReports(reportsWithStatus);
  }, []);

  // Filter reports based on search
  useEffect(() => {
    const filtered = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'under_review':
        return 'Under Review';
      case 'verified':
        return 'Verified';
      case 'flagged':
        return 'Flagged';
      default:
        return status;
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setStaffNotes(report.staffNotes || '');
  };

  const handleVerificationAction = (action: 'valid' | 'invalid' | 'review') => {
    setVerificationAction(action);
    setShowVerificationDialog(true);
  };

  const confirmVerification = () => {
    if (!selectedReport || !verificationAction) return;

    const updatedReports = reports.map((r) => {
      if (r.id === selectedReport.id) {
        let newStatus: string;
        let newVerificationStatus: 'new' | 'under_review' | 'verified' | 'flagged';

        switch (verificationAction) {
          case 'valid':
            newStatus = 'Verified';
            newVerificationStatus = 'verified';
            break;
          case 'invalid':
            newStatus = 'Flagged';
            newVerificationStatus = 'flagged';
            break;
          case 'review':
            newStatus = 'Under Review';
            newVerificationStatus = 'under_review';
            break;
          default:
            newStatus = r.status;
            newVerificationStatus = r.verificationStatus || 'new';
        }

        return {
          ...r,
          status: newStatus,
          verificationStatus: newVerificationStatus,
          staffNotes,
        };
      }
      return r;
    });

    setReports(updatedReports);
    localStorage.setItem('citizen_reports', JSON.stringify(updatedReports));

    const actionLabels = {
      valid: 'marked as Valid',
      invalid: 'marked as Invalid',
      review: 'sent to Admin Review',
    };

    toast.success(`Report ${actionLabels[verificationAction]}`, {
      description: `Tracking ID: ${selectedReport.id}`,
    });

    setShowVerificationDialog(false);
    setSelectedReport(null);
    setStaffNotes('');
    setVerificationAction(null);
  };

  const getReportsByStatus = (status: 'new' | 'under_review' | 'verified' | 'flagged') => {
    return filteredReports.filter((r) => r.verificationStatus === status);
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
      onClick={() => handleViewReport(report)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">{report.category}</Badge>
              <Badge className={getStatusColor(report.verificationStatus || 'new')}>
                {getStatusLabel(report.verificationStatus || 'new')}
              </Badge>
            </div>
            <CardTitle className="text-lg">{report.title}</CardTitle>
          </div>
          <span className="text-xs font-mono text-gray-500">{report.id}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 line-clamp-2 text-sm text-gray-700">{report.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{report.submittedBy}</span>
          </div>
          {report.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{report.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Incoming Reports</h2>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Review and verify public submissions
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New Reports</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {getReportsByStatus('new').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {getReportsByStatus('under_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Verified</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {getReportsByStatus('verified').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Flagged</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {getReportsByStatus('flagged').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search reports by title, category, or submitter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reports ({filteredReports.length})</TabsTrigger>
          <TabsTrigger value="new">New ({getReportsByStatus('new').length})</TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({getReportsByStatus('under_review').length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({getReportsByStatus('verified').length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({getReportsByStatus('flagged').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredReports.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No reports found</p>
            </Card>
          ) : (
            filteredReports.map((report) => <ReportCard key={report.id} report={report} />)
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4 mt-4">
          {getReportsByStatus('new').map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </TabsContent>

        <TabsContent value="under_review" className="space-y-4 mt-4">
          {getReportsByStatus('under_review').map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4 mt-4">
          {getReportsByStatus('verified').map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4 mt-4">
          {getReportsByStatus('flagged').map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      {selectedReport && !showVerificationDialog && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>Review and verify this environmental report</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">{selectedReport.category}</Badge>
                <Badge className={getStatusColor(selectedReport.verificationStatus || 'new')}>
                  {getStatusLabel(selectedReport.verificationStatus || 'new')}
                </Badge>
                <span className="ml-auto text-xs font-mono text-gray-500">
                  {selectedReport.id}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedReport.title}</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-gray-600">Submitted By</p>
                  <p className="font-medium">{selectedReport.submittedBy}</p>
                </div>
                <div>
                  <p className="text-gray-600">Submitted On</p>
                  <p className="font-medium">
                    {new Date(selectedReport.submittedAt).toLocaleString()}
                  </p>
                </div>
                {selectedReport.location && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{selectedReport.location}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="staffNotes">Staff Notes (Optional)</Label>
                <Textarea
                  id="staffNotes"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Add verification notes, observations, or recommendations..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleVerificationAction('review')}
              >
                <Eye className="h-4 w-4" />
                Send to Admin Review
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:bg-red-50"
                onClick={() => handleVerificationAction('invalid')}
              >
                <XCircle className="h-4 w-4" />
                Mark Invalid
              </Button>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleVerificationAction('valid')}
              >
                <CheckCircle className="h-4 w-4" />
                Mark Valid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verification Confirmation Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === 'valid' && 'Confirm Verification'}
              {verificationAction === 'invalid' && 'Flag as Invalid'}
              {verificationAction === 'review' && 'Send to Admin Review'}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === 'valid' &&
                'This report will be marked as verified and may be forwarded to admin for final approval.'}
              {verificationAction === 'invalid' &&
                'This report will be flagged as invalid and will not proceed further.'}
              {verificationAction === 'review' &&
                'This report will be sent to admin for detailed review and decision.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              <strong>Report:</strong> {selectedReport?.title}
            </p>
            {staffNotes && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 font-medium">Your Notes:</p>
                <p className="text-sm text-gray-600 mt-1">{staffNotes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmVerification}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
