import { useState, useEffect } from 'react';
import { useData, PendingRequest } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCircle2, XCircle, Clock, Plus, Pencil, Trash2, AlertCircle, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { MpaBoundaryApprovalsTab } from '../components/MpaBoundaryApprovalsTab';
import { useMpa } from '../contexts/MpaContext';

interface CitizenReport {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
  staffNotes?: string;
  verificationStatus?: 'new' | 'under_review' | 'verified' | 'flagged' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedByAdmin?: string;
  reviewedAtAdmin?: string;
}

type CsvCell = string | number | undefined;

export default function AdminApprovals() {
  const { pendingRequests, approveRequest, rejectRequest } = useData();
  const { getPendingMpaRequestsCount } = useMpa();
  const { user } = useAuth();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Citizen reports state
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReportRejectOpen, setIsReportRejectOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reportAction, setReportAction] = useState<'approve' | 'reject' | null>(null);

  const pendingMpaCount = getPendingMpaRequestsCount();
  const pendingList = pendingRequests.filter((req) => req.status === 'pending');
  const approvedList = pendingRequests.filter((req) => req.status === 'approved');
  const rejectedList = pendingRequests.filter((req) => req.status === 'rejected');

  // Load citizen reports
  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    setCitizenReports(reports);
  }, []);

  // Filter citizen reports by status
  const verifiedReports = citizenReports.filter(r => r.verificationStatus === 'verified');
  const approvedReports = citizenReports.filter(r => r.verificationStatus === 'approved');
  const rejectedReports = citizenReports.filter(r => r.verificationStatus === 'rejected');

  const handleApprove = (request: PendingRequest) => {
    if (!user) return;
    approveRequest(request.id, user.id, user.name);
    toast.success('Request approved successfully');
  };

  const openRejectDialog = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsRejectOpen(true);
  };

  const handleReject = () => {
    if (!user || !selectedRequest) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    rejectRequest(selectedRequest.id, user.id, user.name, rejectionReason);
    toast.success('Request rejected');
    setIsRejectOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const exportReportsCSV = () => {
    // Get verified reports from localStorage
    const reports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
    const verifiedReports = reports.filter((r: any) => r.verificationStatus === 'verified');

    if (verifiedReports.length === 0) {
      toast.error('No verified reports to export');
      return;
    }

    // Generate CSV
    const headers = ['ID', 'Title', 'Category', 'Location', 'Status', 'Submitted By', 'Submitted At', 'Staff Notes'];
    const rows = verifiedReports.map((r: any) => [
      r.id,
      r.title,
      r.category,
      r.location || '',
      r.status,
      r.submittedBy,
      new Date(r.submittedAt).toLocaleString(),
      r.staffNotes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: CsvCell[]) =>
        row.map((cell: CsvCell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verified-reports-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Reports exported successfully');
  };

  const exportApprovalsSummary = () => {
    // Generate summary CSV
    const headers = ['Request ID', 'Action', 'Category', 'Status', 'Submitted By', 'Submitted At', 'Reviewed By', 'Reviewed At', 'Rejection Reason'];
    const rows = pendingRequests.map((r: PendingRequest) => [
      r.id,
      r.action,
      r.data.category,
      r.status,
      r.submittedByName,
      new Date(r.submittedAt).toLocaleString(),
      r.reviewedByName || '',
      r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : '',
      r.rejectionReason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: CsvCell[]) =>
        row.map((cell: CsvCell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `approvals-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Approvals summary exported successfully');
  };

  const handleViewReport = (report: CitizenReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setIsReportDialogOpen(true);
  };

  const handleReportAction = (action: 'approve' | 'reject') => {
    setReportAction(action);
    setIsReportDialogOpen(false);
    if (action === 'reject') {
      setIsReportRejectOpen(true);
    } else {
      confirmReportApproval();
    }
  };

  const confirmReportApproval = () => {
    if (!selectedReport || !user) return;

    const updatedReports = citizenReports.map(r => {
      if (r.id === selectedReport.id) {
        return {
          ...r,
          verificationStatus: 'approved' as const,
          status: 'Approved',
          adminNotes,
          reviewedByAdmin: user.name,
          reviewedAtAdmin: new Date().toISOString()
        };
      }
      return r;
    });

    localStorage.setItem('citizen_reports', JSON.stringify(updatedReports));
    setCitizenReports(updatedReports);
    toast.success('Report approved successfully');
    setSelectedReport(null);
    setAdminNotes('');
    setReportAction(null);
  };

  const confirmReportRejection = () => {
    if (!selectedReport || !user) return;
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const updatedReports = citizenReports.map(r => {
      if (r.id === selectedReport.id) {
        return {
          ...r,
          verificationStatus: 'rejected' as const,
          status: 'Rejected',
          adminNotes,
          reviewedByAdmin: user.name,
          reviewedAtAdmin: new Date().toISOString()
        };
      }
      return r;
    });

    localStorage.setItem('citizen_reports', JSON.stringify(updatedReports));
    setCitizenReports(updatedReports);
    toast.success('Report rejected');
    setIsReportRejectOpen(false);
    setSelectedReport(null);
    setAdminNotes('');
    setReportAction(null);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Pencil className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const RequestCard = ({ request, showActions = false }: { request: PendingRequest; showActions?: boolean }) => (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${getActionColor(request.action)}`}>
            {getActionIcon(request.action)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 capitalize">{request.action} Request</h3>
              <Badge variant="outline" className="text-xs">
                {request.data.category}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Submitted by {request.submittedByName} on{' '}
              {new Date(request.submittedAt).toLocaleDateString()} at{' '}
              {new Date(request.submittedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {request.status === 'pending' && (
          <Badge className="gap-1 bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )}
        {request.status === 'approved' && (
          <Badge className="gap-1 bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )}
        {request.status === 'rejected' && (
          <Badge className="gap-1 bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {request.action === 'update' && request.previousData && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium text-gray-500">CURRENT DATA</p>
            <h4 className="font-medium text-gray-900">{request.previousData.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{request.previousData.description}</p>
          </div>
        )}

        {request.action === 'delete' && request.previousData && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-red-700">
              <AlertCircle className="h-3 w-3" />
              TO BE DELETED
            </p>
            <h4 className="font-medium text-gray-900">{request.previousData.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{request.previousData.description}</p>
          </div>
        )}

        {(request.action === 'create' || request.action === 'update') && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <p className="mb-2 text-xs font-medium text-blue-700">
              {request.action === 'create' ? 'NEW DATA' : 'PROPOSED CHANGES'}
            </p>
            <h4 className="font-medium text-gray-900">{request.data.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{request.data.description}</p>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Approved by {request.reviewedByName} on {new Date(request.reviewedAt!).toLocaleDateString()}
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-900">
              Rejected by {request.reviewedByName} on {new Date(request.reviewedAt!).toLocaleDateString()}
            </p>
            {request.rejectionReason && (
              <p className="mt-1 text-sm text-red-700">Reason: {request.rejectionReason}</p>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 gap-2" onClick={() => handleApprove(request)}>
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => openRejectDialog(request)}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Request Approvals</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Review and approve or reject staff requests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={exportReportsCSV}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Verified Reports</span>
              <span className="sm:hidden">Verified Reports</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={exportApprovalsSummary}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Export Approvals</span>
              <span className="sm:hidden">Approvals</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="mpa-boundaries" className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="mpa-boundaries">
              MPA Boundaries
              {pendingMpaCount > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">{pendingMpaCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="staff-requests">
              Staff Requests
              {pendingList.length > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">{pendingList.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="citizen-reports">
              Citizen Reports
              {verifiedReports.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white">{verifiedReports.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mpa-boundaries">
            <MpaBoundaryApprovalsTab />
          </TabsContent>

          {/* Staff Requests Tab */}
          <TabsContent value="staff-requests">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  Pending
                  {pendingList.length > 0 && (
                    <Badge className="bg-yellow-500 text-white">{pendingList.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedList.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedList.length})</TabsTrigger>
              </TabsList>

          <TabsContent value="pending">
            {pendingList.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 font-semibold text-gray-900">No pending requests</h3>
                <p className="mt-2 text-sm text-gray-600">
                  All staff requests have been reviewed
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingList.map((request) => (
                  <RequestCard key={request.id} request={request} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedList.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 font-semibold text-gray-900">No approved requests</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Approved requests will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedList.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedList.length === 0 ? (
              <Card className="p-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 font-semibold text-gray-900">No rejected requests</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Rejected requests will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedList.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Citizen Reports Tab */}
          <TabsContent value="citizen-reports">
            <Tabs defaultValue="verified" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="verified" className="gap-2">
                  Verified
                  {verifiedReports.length > 0 && (
                    <Badge className="bg-blue-500 text-white">{verifiedReports.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedReports.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedReports.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="verified">
                {verifiedReports.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 font-semibold text-gray-900">No verified reports</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Verified reports from staff will appear here
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {verifiedReports.map((report) => (
                      <Card key={report.id} className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {report.category} • Submitted by {report.submittedBy} on{' '}
                              {new Date(report.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Verified by Staff</Badge>
                        </div>
                        <p className="mb-4 text-sm text-gray-700">{report.description}</p>
                        {report.location && (
                          <p className="mb-4 text-sm text-gray-600">
                            <strong>Location:</strong> {report.location}
                          </p>
                        )}
                        {report.staffNotes && (
                          <div className="mb-4 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-500">STAFF NOTES</p>
                            <p className="mt-1 text-sm text-gray-700">{report.staffNotes}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewReport(report)}
                            className="flex-1"
                          >
                            View Details
                          </Button>
                          <Button
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminNotes(report.adminNotes || '');
                              handleReportAction('approve');
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1 gap-2"
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminNotes(report.adminNotes || '');
                              setIsReportDialogOpen(false);
                              handleReportAction('reject');
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedReports.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 font-semibold text-gray-900">No approved reports</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Approved citizen reports will appear here
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {approvedReports.map((report) => (
                      <Card key={report.id} className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {report.category} • Approved by {report.reviewedByAdmin} on{' '}
                              {report.reviewedAtAdmin ? new Date(report.reviewedAtAdmin).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{report.description}</p>
                        {report.adminNotes && (
                          <div className="mt-3 rounded-lg bg-green-50 p-3">
                            <p className="text-xs font-medium text-green-700">ADMIN NOTES</p>
                            <p className="mt-1 text-sm text-green-900">{report.adminNotes}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedReports.length === 0 ? (
                  <Card className="p-12 text-center">
                    <XCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 font-semibold text-gray-900">No rejected reports</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Rejected citizen reports will appear here
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {rejectedReports.map((report) => (
                      <Card key={report.id} className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {report.category} • Rejected by {report.reviewedByAdmin} on{' '}
                              {report.reviewedAtAdmin ? new Date(report.reviewedAtAdmin).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{report.description}</p>
                        {report.adminNotes && (
                          <div className="mt-3 rounded-lg bg-red-50 p-3">
                            <p className="text-xs font-medium text-red-700">REJECTION REASON</p>
                            <p className="mt-1 text-sm text-red-900">{report.adminNotes}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Staff Request Rejection Dialog */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request. The staff member will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectOpen(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Citizen Report View Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Citizen Report Details</DialogTitle>
              <DialogDescription>Review this verified citizen report</DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedReport.title}</h3>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">{selectedReport.category}</Badge>
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

                {selectedReport.staffNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Staff Notes</p>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-900">{selectedReport.staffNotes}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add final review notes or decision rationale..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportDialogOpen(false);
                  setSelectedReport(null);
                  setAdminNotes('');
                }}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => handleReportAction('reject')}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleReportAction('approve')}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Citizen Report Rejection Dialog */}
        <Dialog open={isReportRejectOpen} onOpenChange={setIsReportRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Citizen Report</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this report. The submitter may be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportRejectionReason">Rejection Reason</Label>
                <Textarea
                  id="reportRejectionReason"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Explain why this report is being rejected..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportRejectOpen(false);
                  setSelectedReport(null);
                  setAdminNotes('');
                  setReportAction(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmReportRejection}>
                Reject Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
