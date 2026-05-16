import { useState } from "react";
import {
  useMpa,
  MpaBoundaryRequest,
} from "../contexts/MpaContext";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MpaPolygonPreview } from "./MpaPolygonPreview";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  MapPin,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

function RequestRow({
  request,
  showActions,
  onApprove,
  onReject,
}: {
  request: MpaBoundaryRequest;
  showActions?: boolean;
  onApprove: (r: MpaBoundaryRequest) => void;
  onReject: (r: MpaBoundaryRequest) => void;
}) {
  const [open, setOpen] = useState(false);

  const actionIcon =
    request.action === "create" ? (
      <Plus className="h-4 w-4" />
    ) : request.action === "update" ? (
      <Pencil className="h-4 w-4" />
    ) : (
      <Trash2 className="h-4 w-4" />
    );

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-800 shrink-0">
                {actionIcon}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {request.mpa.name}
                  </h3>
                  <Badge variant="outline" className="capitalize text-xs">
                    {request.action}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  By {request.submittedByName} ·{" "}
                  {new Date(request.submittedAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {request.mpa.area.toFixed(2)} ha · {request.mpa.barangay} ·{" "}
                  {request.mpa.ordinanceNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {request.status === "pending" && (
                <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
              {request.status === "approved" && (
                <Badge className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </Badge>
              )}
              {request.status === "rejected" && (
                <Badge className="bg-red-100 text-red-800 gap-1">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              )}
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-5 pb-5 pt-4 space-y-4 bg-gray-50/50">
            <MpaPolygonPreview mpa={request.mpa} height={240} />

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">
                  {request.mpa.type.replace("-", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Vertices</p>
                <p className="font-medium">
                  {request.mpa.coordinates.length} points
                </p>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Barangay
                </p>
                <p className="font-medium">{request.mpa.barangay}</p>
              </div>
              <div>
                <p className="text-gray-500">Established</p>
                <p className="font-medium">{request.mpa.dateEstablished}</p>
              </div>
            </div>

            <div className="text-sm rounded-lg bg-white border p-3">
              <p className="text-gray-500 mb-1">Ecosystems (ha)</p>
              <p>
                Mangrove {request.mpa.ecosystems.mangrove} · Seagrass{" "}
                {request.mpa.ecosystems.seagrass} · Coral{" "}
                {request.mpa.ecosystems.coralReef}
              </p>
            </div>

            {request.previousMpa && (
              <div className="text-sm rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-800 mb-1">
                  PREVIOUS BOUNDARY
                </p>
                <p className="font-medium">{request.previousMpa.name}</p>
                <p className="text-amber-900">
                  {request.previousMpa.area} ha ·{" "}
                  {request.previousMpa.ordinanceNumber}
                </p>
              </div>
            )}

            {request.status === "rejected" && request.rejectionReason && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                Rejected: {request.rejectionReason}
              </div>
            )}

            {request.status === "approved" && request.reviewedByName && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Approved by {request.reviewedByName} on{" "}
                {request.reviewedAt
                  ? new Date(request.reviewedAt).toLocaleString()
                  : ""}
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(request)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => onReject(request)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function MpaBoundaryApprovalsTab() {
  const { user } = useAuth();
  const {
    boundaryRequests,
    approveBoundaryRequest,
    rejectBoundaryRequest,
    refreshFromStorage,
  } = useMpa();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState<MpaBoundaryRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pending = boundaryRequests.filter((r) => r.status === "pending");
  const approved = boundaryRequests.filter((r) => r.status === "approved");
  const rejected = boundaryRequests.filter((r) => r.status === "rejected");

  const handleApprove = (request: MpaBoundaryRequest) => {
    if (!user) return;
    approveBoundaryRequest(request.id, user.id, user.name);
    refreshFromStorage();
    toast.success(`"${request.mpa.name}" approved — now visible on all maps`);
  };

  const openReject = (request: MpaBoundaryRequest) => {
    setSelected(request);
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!user || !selected) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectBoundaryRequest(
      selected.id,
      user.id,
      user.name,
      rejectionReason,
    );
    refreshFromStorage();
    toast.success("Request rejected — staff will be notified");
    setRejectOpen(false);
    setSelected(null);
    setRejectionReason("");
  };

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pending.length > 0 && (
              <Badge className="bg-yellow-500 text-white">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 font-semibold text-gray-900">
                No pending MPA boundary requests
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Staff map editor submissions will appear here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  showActions
                  onApprove={handleApprove}
                  onReject={openReject}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approved.length === 0 ? (
            <Card className="p-12 text-center text-gray-600">
              No approved boundary requests yet
            </Card>
          ) : (
            <div className="space-y-3">
              {approved.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={openReject}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejected.length === 0 ? (
            <Card className="p-12 text-center text-gray-600">
              No rejected boundary requests
            </Card>
          ) : (
            <div className="space-y-3">
              {rejected.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={openReject}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject MPA Boundary Request</DialogTitle>
            <DialogDescription>
              The staff member will be notified with your reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="mpa-reject-reason">Rejection reason</Label>
            <Textarea
              id="mpa-reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Explain what needs to be corrected..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
