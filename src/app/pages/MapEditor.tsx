import { useState, useEffect } from "react";
import { MapView } from "../components/MapView";
import { MPA } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { useMpa, MpaRequestAction } from "../contexts/MpaContext";
import { SubmitMpaRequestDialog } from "../components/SubmitMpaRequestDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  PenTool,
  Save,
  X,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Send,
  Bell,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  CoordinateSystem,
  OrdinancePolygonTool,
} from "../components/OrdinancePolygonTool";

export function MapEditor() {
  const { user, isStaff, isAdmin } = useAuth();
  const {
    getEditorMpas,
    publishMpa,
    submitBoundaryRequest,
    getNotificationsForUser,
    markNotificationsRead,
    saveStaffDraft,
    allMpas,
    boundaryRequests,
    refreshFromStorage,
  } = useMpa();

  const isStaffOnly = isStaff && !isAdmin;

  const [mpas, setMpas] = useState<MPA[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<{
    mpa: MPA;
    action: MpaRequestAction;
    previousMpa?: MPA;
  } | null>(null);
  const [pendingDraftMpa, setPendingDraftMpa] = useState<MPA | null>(null);

  const syncEditorMpas = () => {
    if (user) {
      setMpas(getEditorMpas(user.id, isStaffOnly));
    }
  };

  useEffect(() => {
    syncEditorMpas();
  }, [user, allMpas, boundaryRequests, isStaffOnly]);

  useEffect(() => {
    const onStorage = () => refreshFromStorage();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshFromStorage]);

  const staffNotifs = user ? getNotificationsForUser(user.id) : [];
  const unreadCount = staffNotifs.filter((n) => !n.read).length;

  const hasPendingRequest = (mpaId: string) =>
    boundaryRequests.some(
      (r) => r.mpa.id === mpaId && r.status === "pending",
    );
  const [selectedMpa, setSelectedMpa] = useState<string | null>(
    null,
  );
  const [geometryEditMode, setGeometryEditMode] =
    useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showNewMpaForm, setShowNewMpaForm] = useState(false);
  const [newMpaData, setNewMpaData] = useState<Partial<MPA>>({
    name: "",
    type: "core",
    ordinanceNumber: "",
    dateEstablished: "",
    barangay: "",
    ecosystems: {
      mangrove: 0,
      seagrass: 0,
      coralReef: 0,
    },
  });

  const [drawnCoordinates, setDrawnCoordinates] = useState<
    [number, number][] | null
  >(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<MPA>>({});
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [coordinateSystem, setCoordinateSystem] =
    useState<CoordinateSystem>("WGS84");
  const [baseMapStyle, setBaseMapStyle] = useState<
    "street" | "satellite"
  >("street");
  const selectedMpaData = mpas.find(
    (m) => m.id === selectedMpa,
  );
  useEffect(() => {
    if (selectedMpaData) {
      setEditData(selectedMpaData);
      setEditMode(false);
    }
  }, [selectedMpaData]);

  const handleStartDrawing = () => {
    setDrawingMode(true);
    setShowNewMpaForm(true);
    setSelectedMpa(null);
  };

  const handleDrawComplete = (
    coordinates: [number, number][],
  ) => {
    setDrawnCoordinates(coordinates);
    setDrawingMode(false);
    toast.success(
      "Boundary drawn successfully! Fill in the MPA details below.",
    );
  };

  const buildNewMpaFromForm = (): MPA | null => {
    if (
      !drawnCoordinates ||
      !newMpaData.name ||
      !newMpaData.ordinanceNumber
    ) {
      toast.error("Please complete all required fields");
      return null;
    }

    const area = calculatePolygonArea(drawnCoordinates);

    return {
      id: pendingDraftMpa?.id ?? `mpa-${Date.now()}`,
      name: newMpaData.name,
      type: newMpaData.type as MPA["type"],
      ordinanceNumber: newMpaData.ordinanceNumber,
      dateEstablished:
        newMpaData.dateEstablished ||
        new Date().toISOString().split("T")[0],
      area,
      coordinates: drawnCoordinates,
      barangay: newMpaData.barangay || "Unknown",
      status: isStaffOnly ? "pending" : "active",
      ecosystems: newMpaData.ecosystems || {
        mangrove: 0,
        seagrass: 0,
        coralReef: 0,
      },
    };
  };

  const resetNewMpaForm = () => {
    setShowNewMpaForm(false);
    setDrawnCoordinates(null);
    setPendingDraftMpa(null);
    setNewMpaData({
      name: "",
      type: "core",
      ordinanceNumber: "",
      dateEstablished: "",
      barangay: "",
      ecosystems: { mangrove: 0, seagrass: 0, coralReef: 0 },
    });
  };

  const handleSaveNewMpa = () => {
    const newMpa = buildNewMpaFromForm();
    if (!newMpa) return;

    if (isStaffOnly) {
      saveStaffDraft(newMpa);
      setPendingDraftMpa(newMpa);
      syncEditorMpas();
      refreshFromStorage();
      toast.success(`Draft saved: "${newMpa.name}"`, {
        description: "Send request to admin when ready for review.",
      });
      return;
    }

    publishMpa(newMpa);
    setMpas((prev) => {
      const exists = prev.some((m) => m.id === newMpa.id);
      return exists
        ? prev.map((m) => (m.id === newMpa.id ? newMpa : m))
        : [...prev, newMpa];
    });
    resetNewMpaForm();
    refreshFromStorage();
    toast.success(`MPA "${newMpa.name}" published to map`, {
      description: `Area: ${newMpa.area.toFixed(2)} hectares`,
    });
  };

  const openSubmitDialog = (
    mpa: MPA,
    action: MpaRequestAction,
    previousMpa?: MPA,
  ) => {
    setSubmitTarget({ mpa, action, previousMpa });
    setSubmitDialogOpen(true);
  };

  const handleSendNewMpaRequest = () => {
    const newMpa = buildNewMpaFromForm();
    if (!newMpa) return;
    setPendingDraftMpa(newMpa);
    setMpas((prev) => {
      const exists = prev.some((m) => m.id === newMpa.id);
      return exists
        ? prev.map((m) => (m.id === newMpa.id ? newMpa : m))
        : [...prev, newMpa];
    });
    openSubmitDialog(newMpa, "create");
  };

  const handleConfirmSubmit = () => {
    if (!submitTarget) return;
    submitBoundaryRequest(
      submitTarget.action,
      submitTarget.mpa,
      submitTarget.previousMpa,
    );
    refreshFromStorage();
    if (submitTarget.action === "create" && showNewMpaForm) {
      resetNewMpaForm();
    }
    toast.success("Request sent to admin for approval", {
      description: `"${submitTarget.mpa.name}" is pending review.`,
    });
    setSubmitTarget(null);
    syncEditorMpas();
  };

  const handleSendUpdateRequest = () => {
    if (!selectedMpaData) return;
    const current = mpas.find((m) => m.id === selectedMpa) ?? selectedMpaData;
    const updated: MPA = {
      ...current,
      ...editData,
      coordinates: editData.coordinates || current.coordinates,
    };
    openSubmitDialog(updated, "update", selectedMpaData);
  };

  const handleSendDeleteRequest = () => {
    if (!selectedMpaData) return;
    if (selectedMpaData.status === "active") {
      openSubmitDialog(selectedMpaData, "delete", selectedMpaData);
    } else {
      setMpas((prev) => prev.filter((m) => m.id !== selectedMpaData.id));
      setSelectedMpa(null);
      toast.success("Draft removed");
    }
  };

  const handleSendDraftFromList = (mpa: MPA) => {
    const isNew =
      mpa.status === "pending" ||
      !allMpas.some((m) => m.id === mpa.id && m.status === "active");
    openSubmitDialog(
      mpa,
      isNew ? "create" : "update",
      isNew ? undefined : allMpas.find((m) => m.id === mpa.id),
    );
  };

  const calculatePolygonArea = (
    coords: [number, number][],
  ): number => {
    // Simple area calculation using shoelace formula
    // Returns approximate area in hectares
    if (coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1];
      area -= coords[i + 1][0] * coords[i][1];
    }
    area = Math.abs(area / 2);

    // Convert to hectares (rough approximation for demonstration)
    // In production, use proper geographic calculations
    return area * 12300; // Scaling factor
  };

  const handleCancelDrawing = () => {
    setDrawingMode(false);
    setShowNewMpaForm(false);
    setDrawnCoordinates(null);
    setNewMpaData({
      name: "",
      type: "core",
      ordinanceNumber: "",
      dateEstablished: "",
      barangay: "",
      ecosystems: { mangrove: 0, seagrass: 0, coralReef: 0 },
    });
  };
  const handleUpdateMpa = () => {
    if (!editData.name || !editData.ordinanceNumber || !selectedMpa) {
      toast.error("Please complete required fields");
      return;
    }

    const updated = mpas.map((m) => {
      if (m.id !== selectedMpa) return m;
      const nextCoords = editData.coordinates || m.coordinates;
      return {
        ...m,
        ...editData,
        coordinates: nextCoords,
        multiPolygonRings:
          m.multiPolygonRings && m.multiPolygonRings.length > 1
            ? [nextCoords, ...m.multiPolygonRings.slice(1)]
            : m.multiPolygonRings,
      };
    });

    const changed = updated.find((m) => m.id === selectedMpa)!;

    if (isStaffOnly) {
      saveStaffDraft(changed);
      setMpas(updated);
      setEditMode(false);
      refreshFromStorage();
      syncEditorMpas();
      toast.success("Changes saved locally", {
        description: "Send request to admin to publish updates.",
      });
      return;
    }

    publishMpa({ ...changed, status: "active" });
    setMpas(updated);
    setEditMode(false);
    refreshFromStorage();
    toast.success("MPA updated and published!");
  };

  const updateCoordinatePoint = (
    index: number,
    axis: "lat" | "lng",
    value: string,
  ) => {
    if (!selectedMpaData) return;
    const baseCoordinates =
      editData.coordinates || selectedMpaData.coordinates;
    const nextCoordinates = [...baseCoordinates];
    const parsed = parseFloat(value);
    const safeValue = Number.isFinite(parsed)
      ? parsed
      : axis === "lat"
        ? nextCoordinates[index][0]
        : nextCoordinates[index][1];

    nextCoordinates[index] =
      axis === "lat"
        ? [safeValue, nextCoordinates[index][1]]
        : [nextCoordinates[index][0], safeValue];

    setEditData({
      ...editData,
      coordinates: nextCoordinates,
    });
  };

  const editorLayoutClass = fullscreenMode
    ? "fixed inset-0 z-[60] bg-white p-6 overflow-y-auto"
    : "";

  const makeImportedMpa = (
    rings: [number, number][][],
    name: string,
  ): MPA => {
    const valid = rings.filter((r) => r.length >= 4);
    const totalArea = valid.reduce(
      (sum, r) => sum + calculatePolygonArea(r),
      0,
    );
    return {
      id: `mpa-import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      name: name || "Imported Ordinance MPA",
      type: "core",
      ordinanceNumber: "ORD-IMPORT",
      dateEstablished: new Date().toISOString().split("T")[0],
      area: totalArea,
      coordinates: valid[0],
      multiPolygonRings: valid.length > 1 ? valid : undefined,
      barangay: "To classify",
      status: "pending",
      ecosystems: {
        mangrove: 0,
        seagrass: 0,
        coralReef: 0,
      },
    };
  };

  const handleApplyOrdinancePolygon = ({
    rings,
    suggestedName,
    separateMpas,
    ringLabels,
  }: {
    rings: [number, number][][];
    suggestedName: string;
    /** One MPA per ring (e.g. West and East as two list entries) */
    separateMpas?: boolean;
    /** From ordinance headings; when set, used instead of West/East/North/South by index */
    ringLabels?: string[];
  }) => {
    const paired = rings
      .map((ring, i) => ({
        ring,
        label: ringLabels?.[i],
      }))
      .filter(({ ring }) => ring.length >= 4);
    const valid = paired.map((p) => p.ring);
    if (valid.length === 0) {
      toast.error(
        "Each polygon needs at least 3 vertices before applying.",
      );
      return;
    }

    const base = suggestedName || "Imported Ordinance MPA";
    const defaultSectionLabels = ["West", "East", "North", "South"];

    if (separateMpas && valid.length > 1) {
      const batch = valid.map((ring, i) =>
        makeImportedMpa(
          [ring],
          `${base} — ${paired[i].label ?? defaultSectionLabels[i] ?? `Zone ${i + 1}`}`,
        ),
      );
      if (isStaffOnly) {
        batch.forEach((mpa) => saveStaffDraft(mpa));
        setMpas((prev) => [...prev, ...batch]);
        setSelectedMpa(batch[batch.length - 1].id);
        refreshFromStorage();
        syncEditorMpas();
        toast.success(
          `Added ${batch.length} draft MPAs. Send each to admin for approval.`,
        );
      } else {
        batch.forEach((mpa) => publishMpa({ ...mpa, status: "active" }));
        setMpas((prev) => [...prev, ...batch.map((m) => ({ ...m, status: "active" as const }))]);
        setSelectedMpa(batch[batch.length - 1].id);
        refreshFromStorage();
        toast.success(
          `Added ${batch.length} separate MPAs from ordinance sections.`,
        );
      }
    } else {
      const importedMpa = makeImportedMpa(valid, base);
      if (isStaffOnly) {
        saveStaffDraft(importedMpa);
        setMpas((prev) => [...prev, importedMpa]);
        setSelectedMpa(importedMpa.id);
        refreshFromStorage();
        syncEditorMpas();
        toast.success(
          `Draft "${importedMpa.name}" added. Send request to admin when ready.`,
        );
      } else {
        publishMpa({ ...importedMpa, status: "active" });
        setMpas((prev) => [...prev, { ...importedMpa, status: "active" }]);
        setSelectedMpa(importedMpa.id);
        refreshFromStorage();
        toast.success(
          valid.length > 1
            ? `Applied "${importedMpa.name}" with ${valid.length} separate areas (one MPA).`
            : `Polygon applied to map as "${importedMpa.name}"`,
        );
      }
    }

    setShowNewMpaForm(false);
    setEditMode(false);
    setGeometryEditMode(false);
  };

  return (
    <div className={`space-y-6 ${editorLayoutClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Interactive Map Editor
          </h2>
          <p className="text-gray-600 mt-1">
            {isStaffOnly
              ? "Create and edit boundaries, then send requests for admin approval"
              : "Visualize, create, and edit MPA boundaries"}
          </p>
        </div>
        <div className="flex gap-2 sticky top-2 z-[70]">
          <Button
            variant={fullscreenMode ? "default" : "outline"}
            onClick={() => setFullscreenMode((prev) => !prev)}
            className={fullscreenMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            {fullscreenMode ? (
              <Minimize2 className="w-4 h-4 mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            {fullscreenMode ? "Exit Full Screen" : "Full Screen"}
          </Button>
          {!drawingMode && !showNewMpaForm && (
            <Button
              onClick={handleStartDrawing}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Draw New MPA
            </Button>
          )}
          {(drawingMode || showNewMpaForm) && (
            <Button
              variant="outline"
              onClick={handleCancelDrawing}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {isStaffOnly && unreadCount > 0 && user && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <Bell className="w-4 h-4" />
            <span>
              {staffNotifs
                .filter((n) => !n.read)
                .map((n) => n.message)
                .join(" ")}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-green-300 text-green-800"
            onClick={() => markNotificationsRead(user.id)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card
            className={
              fullscreenMode ? "h-[calc(100vh-160px)]" : "h-[700px]"
            }
          >
            <CardContent className="p-0 h-full">
              <MapView
                mpas={mpas}
                selectedMpa={selectedMpa}
                onSelectMpa={setSelectedMpa}
                drawingMode={drawingMode}
                onDrawComplete={handleDrawComplete}
                geometryEditMode={geometryEditMode}
                coordinateSystem={coordinateSystem}
                onCoordinateSystemChange={setCoordinateSystem}
                baseMapStyle={baseMapStyle}
                onBaseMapStyleChange={setBaseMapStyle}
                onGeometryChange={(coords) => {
                  setMpas((prev) =>
                    prev.map((m) =>
                      m.id === selectedMpa
                        ? {
                            ...m,
                            coordinates: coords,
                            multiPolygonRings:
                              m.multiPolygonRings &&
                              m.multiPolygonRings.length > 1
                                ? [
                                    coords,
                                    ...m.multiPolygonRings.slice(1),
                                  ]
                                : m.multiPolygonRings,
                          }
                        : m,
                    ),
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* New MPA Form */}
          {showNewMpaForm && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  New MPA Details
                </CardTitle>
                <CardDescription>
                  {drawnCoordinates
                    ? "Boundary drawn - enter MPA information"
                    : "Draw boundary on map first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mpa-name">MPA Name *</Label>
                  <Input
                    id="mpa-name"
                    placeholder="e.g., Honda Bay Marine Sanctuary"
                    value={newMpaData.name}
                    onChange={(e) =>
                      setNewMpaData({
                        ...newMpaData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpa-type">Type *</Label>
                  <Select
                    value={newMpaData.type}
                    onValueChange={(value) =>
                      setNewMpaData({
                        ...newMpaData,
                        type: value as MPA["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">
                        Core Protection
                      </SelectItem>
                      <SelectItem value="buffer">
                        Buffer Zone
                      </SelectItem>
                      <SelectItem value="multiple-use">
                        Multiple Use
                      </SelectItem>
                      <SelectItem value="fishery-reserve">
                        Fishery Reserve
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ordinance">
                    Ordinance Number *
                  </Label>
                  <Input
                    id="ordinance"
                    placeholder="e.g., CO-XXX-2026"
                    value={newMpaData.ordinanceNumber}
                    onChange={(e) =>
                      setNewMpaData({
                        ...newMpaData,
                        ordinanceNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Input
                    id="barangay"
                    placeholder="e.g., Honda Bay"
                    value={newMpaData.barangay}
                    onChange={(e) =>
                      setNewMpaData({
                        ...newMpaData,
                        barangay: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date Established</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMpaData.dateEstablished}
                    onChange={(e) =>
                      setNewMpaData({
                        ...newMpaData,
                        dateEstablished: e.target.value,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Ecosystem Areas (hectares)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="mangrove"
                        className="text-xs"
                      >
                        Mangrove
                      </Label>
                      <Input
                        id="mangrove"
                        type="number"
                        placeholder="0.0"
                        value={
                          newMpaData.ecosystems?.mangrove || 0
                        }
                        onChange={(e) =>
                          setNewMpaData({
                            ...newMpaData,
                            ecosystems: {
                              ...newMpaData.ecosystems!,
                              mangrove:
                                parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="seagrass"
                        className="text-xs"
                      >
                        Seagrass
                      </Label>
                      <Input
                        id="seagrass"
                        type="number"
                        placeholder="0.0"
                        value={
                          newMpaData.ecosystems?.seagrass || 0
                        }
                        onChange={(e) =>
                          setNewMpaData({
                            ...newMpaData,
                            ecosystems: {
                              ...newMpaData.ecosystems!,
                              seagrass:
                                parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label
                        htmlFor="coral"
                        className="text-xs"
                      >
                        Coral Reef
                      </Label>
                      <Input
                        id="coral"
                        type="number"
                        placeholder="0.0"
                        value={
                          newMpaData.ecosystems?.coralReef || 0
                        }
                        onChange={(e) =>
                          setNewMpaData({
                            ...newMpaData,
                            ecosystems: {
                              ...newMpaData.ecosystems!,
                              coralReef:
                                parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {drawnCoordinates && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Boundary captured (
                        {drawnCoordinates.length} points)
                      </span>
                    </div>
                  </div>
                )}

                {isStaffOnly ? (
                  <div className="space-y-2">
                    <Button
                      onClick={handleSaveNewMpa}
                      disabled={
                        !drawnCoordinates ||
                        !newMpaData.name ||
                        !newMpaData.ordinanceNumber
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSendNewMpaRequest}
                      disabled={
                        !drawnCoordinates ||
                        !newMpaData.name ||
                        !newMpaData.ordinanceNumber
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Request to Admin
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSaveNewMpa}
                    disabled={
                      !drawnCoordinates ||
                      !newMpaData.name ||
                      !newMpaData.ordinanceNumber
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save MPA
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selected MPA Details */}
          {selectedMpaData && !showNewMpaForm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                {/* LEFT: TITLE */}
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {editMode ? (
                    <Input
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    selectedMpaData.name
                  )}
                </CardTitle>

                {/* RIGHT: BADGE + BUTTONS */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedMpaData.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedMpaData.status}
                  </Badge>
                  <div className="flex gap-2">
                    {/* NEW: Map / geometry edit toggle (always visible when MPA is selected) */}
                    <Button
                      size="sm"
                      onClick={() =>
                        setGeometryEditMode(!geometryEditMode)
                      }
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {geometryEditMode
                        ? "Stop Edit Shape"
                        : "Edit Shape"}
                    </Button>

                    {/* TEXT EDIT MODE */}
                    {!editMode ? (
                      <Button
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={handleUpdateMpa}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Save
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  {editMode ? (
                    <Select
                      value={editData.type}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          type: value as MPA["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="core">
                          Core Protection
                        </SelectItem>
                        <SelectItem value="buffer">
                          Buffer Zone
                        </SelectItem>
                        <SelectItem value="multiple-use">
                          Multiple Use
                        </SelectItem>
                        <SelectItem value="fishery-reserve">
                          Fishery Reserve
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium capitalize">
                      {selectedMpaData.type.replace("-", " ")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Barangay
                  </p>
                  {editMode ? (
                    <Input
                      value={editData.barangay || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          barangay: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="font-medium">
                      {selectedMpaData.barangay}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-medium">
                    {selectedMpaData.area} hectares
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Ordinance
                  </p>
                  {editMode ? (
                    <Input
                      value={editData.ordinanceNumber || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          ordinanceNumber: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="font-medium">
                      {selectedMpaData.ordinanceNumber}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Established
                  </p>
                  {editMode ? (
                    <Input
                      type="date"
                      value={editData.dateEstablished || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          dateEstablished: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="font-medium">
                      {selectedMpaData.dateEstablished}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-2">
                    Ecosystems
                  </p>

                  <div className="space-y-2">
                    {/* Mangrove */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Mangrove
                      </span>

                      {editMode ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={
                            editData.ecosystems?.mangrove ?? 0
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              ecosystems: {
                                ...editData.ecosystems!,
                                mangrove:
                                  parseFloat(e.target.value) ||
                                  0,
                              },
                            })
                          }
                        />
                      ) : (
                        <span className="font-medium">
                          {selectedMpaData.ecosystems.mangrove}{" "}
                          ha
                        </span>
                      )}
                    </div>

                    {/* Seagrass */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Seagrass
                      </span>

                      {editMode ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={
                            editData.ecosystems?.seagrass ?? 0
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              ecosystems: {
                                ...editData.ecosystems!,
                                seagrass:
                                  parseFloat(e.target.value) ||
                                  0,
                              },
                            })
                          }
                        />
                      ) : (
                        <span className="font-medium">
                          {selectedMpaData.ecosystems.seagrass}{" "}
                          ha
                        </span>
                      )}
                    </div>

                    {/* Coral Reef */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Coral Reef
                      </span>

                      {editMode ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={
                            editData.ecosystems?.coralReef ?? 0
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              ecosystems: {
                                ...editData.ecosystems!,
                                coralReef:
                                  parseFloat(e.target.value) ||
                                  0,
                              },
                            })
                          }
                        />
                      ) : (
                        <span className="font-medium">
                          {selectedMpaData.ecosystems.coralReef}{" "}
                          ha
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isStaffOnly && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                      onClick={handleSendUpdateRequest}
                      disabled={hasPendingRequest(selectedMpaData.id)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Request to Admin
                    </Button>
                    {hasPendingRequest(selectedMpaData.id) && (
                      <p className="text-xs text-amber-700 text-center">
                        A request for this MPA is already pending admin review.
                      </p>
                    )}
                    {selectedMpaData.status === "active" && (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleSendDeleteRequest}
                        disabled={hasPendingRequest(selectedMpaData.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Request Deletion
                      </Button>
                    )}
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-2">
                    Coordinates
                  </p>
                  {selectedMpaData.multiPolygonRings &&
                    selectedMpaData.multiPolygonRings.length > 1 && (
                      <p className="text-xs text-gray-600 mb-2">
                        Multi-area MPA: {selectedMpaData.multiPolygonRings.length}{" "}
                        polygons. This list is the first area; map shows all.
                      </p>
                    )}
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto space-y-2">
                    {(editMode
                      ? editData.coordinates ||
                        selectedMpaData.coordinates
                      : selectedMpaData.coordinates
                    ).map(
                      (coord, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center"
                        >
                          <span className="text-gray-500">
                            {i + 1}.
                          </span>
                          {editMode ? (
                            <Input
                              type="number"
                              step="0.000001"
                              value={coord[0]}
                              onChange={(e) =>
                                updateCoordinatePoint(
                                  i,
                                  "lat",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <span>[{coord[0].toFixed(6)}</span>
                          )}
                          {editMode ? (
                            <Input
                              type="number"
                              step="0.000001"
                              value={coord[1]}
                              onChange={(e) =>
                                updateCoordinatePoint(
                                  i,
                                  "lng",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <span>{coord[1].toFixed(6)}]</span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          {!selectedMpaData && !showNewMpaForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      How to use
                    </h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Click on any MPA to view details</li>
                      <li>
                        Click "Draw New MPA" to create
                        boundaries
                      </li>
                      <li>Click on map to add points</li>
                      <li>
                        Double-click or right-click to complete
                        the polygon
                      </li>
                      <li>
                        Fill in the MPA information and save
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MPA List */}
          <Card>
            <CardHeader>
              <CardTitle>All MPAs ({mpas.length})</CardTitle>
              <CardDescription>
                Click to view on map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mpas.map((mpa) => (
                  <div
                    key={mpa.id}
                    className={`rounded-lg border transition-colors ${
                      selectedMpa === mpa.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMpa(mpa.id)}
                      className="w-full text-left p-3 hover:bg-gray-50/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm min-w-0">
                          {mpa.name}
                        </div>
                        {mpa.status !== "active" && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs capitalize"
                          >
                            {hasPendingRequest(mpa.id)
                              ? "pending review"
                              : mpa.status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {mpa.area} ha • {mpa.barangay}
                      </div>
                    </button>
                    {isStaffOnly &&
                      mpa.status !== "active" &&
                      !hasPendingRequest(mpa.id) && (
                        <div className="px-3 pb-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => handleSendDraftFromList(mpa)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send to Admin
                          </Button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OrdinancePolygonTool
        coordinateSystem={coordinateSystem}
        onApplyToMap={handleApplyOrdinancePolygon}
      />

      <SubmitMpaRequestDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        mpa={submitTarget?.mpa ?? null}
        action={submitTarget?.action ?? "create"}
        previousMpa={submitTarget?.previousMpa}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}