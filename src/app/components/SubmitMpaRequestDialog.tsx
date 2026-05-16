import { MPA } from "../data/mockData";
import { MpaPolygonPreview } from "./MpaPolygonPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { MapPin, FileText, AlertCircle } from "lucide-react";
import { MpaRequestAction } from "../contexts/MpaContext";

interface SubmitMpaRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mpa: MPA | null;
  action: MpaRequestAction;
  onConfirm: () => void;
  previousMpa?: MPA;
}

export function SubmitMpaRequestDialog({
  open,
  onOpenChange,
  mpa,
  action,
  onConfirm,
  previousMpa,
}: SubmitMpaRequestDialogProps) {
  if (!mpa) return null;

  const actionLabel =
    action === "create"
      ? "Create new MPA boundary"
      : action === "update"
        ? "Update MPA boundary"
        : "Delete MPA boundary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Request to Admin</DialogTitle>
          <DialogDescription>
            Review the summary below. Are you sure you want to send this request
            for admin approval?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 capitalize">
              {action}
            </Badge>
            <span className="text-sm text-gray-600">{actionLabel}</span>
          </div>

          <MpaPolygonPreview mpa={mpa} height={220} />

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              {mpa.name}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">
                  {mpa.type.replace("-", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Area</p>
                <p className="font-medium">{mpa.area.toFixed(2)} hectares</p>
              </div>
              <div>
                <p className="text-gray-500">Barangay</p>
                <p className="font-medium">{mpa.barangay}</p>
              </div>
              <div>
                <p className="text-gray-500">Ordinance</p>
                <p className="font-medium">{mpa.ordinanceNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Established</p>
                <p className="font-medium">{mpa.dateEstablished}</p>
              </div>
              <div>
                <p className="text-gray-500">Boundary points</p>
                <p className="font-medium">{mpa.coordinates.length} vertices</p>
              </div>
            </div>

            {mpa.multiPolygonRings && mpa.multiPolygonRings.length > 1 && (
              <p className="text-xs text-blue-700">
                Multi-area MPA: {mpa.multiPolygonRings.length} polygon sections
              </p>
            )}

            <Separator />

            <div className="text-sm">
              <p className="text-gray-500 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Ecosystem coverage (ha)
              </p>
              <p>
                Mangrove: {mpa.ecosystems.mangrove} · Seagrass:{" "}
                {mpa.ecosystems.seagrass} · Coral reef:{" "}
                {mpa.ecosystems.coralReef}
              </p>
            </div>
          </div>

          {action === "delete" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <p className="font-medium">This will request removal of an active MPA.</p>
              <p className="mt-1">
                The boundary stays on public maps until an admin approves deletion.
              </p>
            </div>
          )}

          {action === "update" && previousMpa && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="text-xs font-medium text-gray-500 mb-1">
                PREVIOUS VERSION
              </p>
              <p className="font-medium">{previousMpa.name}</p>
              <p className="text-gray-600">
                {previousMpa.area} ha · {previousMpa.ordinanceNumber}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This boundary will not appear on public maps until an admin
              approves your request. You will be notified when the review is
              complete.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-teal-600"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
