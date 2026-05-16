import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { mockMPAs, MPA } from "../data/mockData";
import { useAuth } from "./AuthContext";

export type MpaRequestAction = "create" | "update" | "delete";
export type MpaRequestStatus = "pending" | "approved" | "rejected";

export interface MpaBoundaryRequest {
  id: string;
  action: MpaRequestAction;
  mpa: MPA;
  previousMpa?: MPA;
  status: MpaRequestStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface StaffNotification {
  id: string;
  userId: string;
  message: string;
  mpaName: string;
  type: "approved" | "rejected";
  read: boolean;
  createdAt: string;
}

const MPA_STORE_KEY = "mpa_geometry_store";
const MPA_DRAFT_KEY = "mpa_draft_store";
const MPA_PENDING_KEY = "mpa_boundary_pending";
const MPA_NOTIFICATIONS_KEY = "mpa_staff_notifications";

interface MpaContextType {
  allMpas: MPA[];
  draftMpas: MPA[];
  activeMpas: MPA[];
  boundaryRequests: MpaBoundaryRequest[];
  staffNotifications: StaffNotification[];
  getEditorMpas: (userId: string, isStaff: boolean) => MPA[];
  publishMpa: (mpa: MPA) => void;
  updateMpaInStore: (mpa: MPA) => void;
  removeMpaFromStore: (mpaId: string) => void;
  submitBoundaryRequest: (
    action: MpaRequestAction,
    mpa: MPA,
    previousMpa?: MPA,
  ) => void;
  approveBoundaryRequest: (
    requestId: string,
    reviewerId: string,
    reviewerName: string,
  ) => void;
  rejectBoundaryRequest: (
    requestId: string,
    reviewerId: string,
    reviewerName: string,
    reason: string,
  ) => void;
  getPendingMpaRequestsCount: () => number;
  getUnreadNotificationsCount: (userId: string) => number;
  getNotificationsForUser: (userId: string) => StaffNotification[];
  markNotificationsRead: (userId: string) => void;
  saveStaffDraft: (mpa: MPA) => void;
  refreshFromStorage: () => void;
}

const MpaContext = createContext<MpaContextType | undefined>(undefined);

function loadStore(): MPA[] {
  const stored = localStorage.getItem(MPA_STORE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MPA[];
    } catch {
      return [...mockMPAs];
    }
  }
  return [...mockMPAs];
}

function loadPending(): MpaBoundaryRequest[] {
  const stored = localStorage.getItem(MPA_PENDING_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MpaBoundaryRequest[];
    } catch {
      return [];
    }
  }
  return [];
}

function loadNotifications(): StaffNotification[] {
  const stored = localStorage.getItem(MPA_NOTIFICATIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as StaffNotification[];
    } catch {
      return [];
    }
  }
  return [];
}

function loadDrafts(): MPA[] {
  const stored = localStorage.getItem(MPA_DRAFT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MPA[];
    } catch {
      return [];
    }
  }
  return [];
}

export function MpaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allMpas, setAllMpas] = useState<MPA[]>([]);
  const [draftMpas, setDraftMpas] = useState<MPA[]>([]);
  const [boundaryRequests, setBoundaryRequests] = useState<
    MpaBoundaryRequest[]
  >([]);
  const [staffNotifications, setStaffNotifications] = useState<
    StaffNotification[]
  >([]);

  const refreshFromStorage = useCallback(() => {
    if (!localStorage.getItem(MPA_STORE_KEY)) {
      localStorage.setItem(MPA_STORE_KEY, JSON.stringify(mockMPAs));
    }
    setAllMpas(loadStore());
    setDraftMpas(loadDrafts());
    setBoundaryRequests(loadPending());
    setStaffNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  const activeMpas = allMpas.filter((m) => m.status === "active");

  const persistStore = (mpas: MPA[]) => {
    setAllMpas(mpas);
    localStorage.setItem(MPA_STORE_KEY, JSON.stringify(mpas));
  };

  const persistDrafts = (drafts: MPA[]) => {
    setDraftMpas(drafts);
    localStorage.setItem(MPA_DRAFT_KEY, JSON.stringify(drafts));
  };

  const persistPending = (requests: MpaBoundaryRequest[]) => {
    setBoundaryRequests(requests);
    localStorage.setItem(MPA_PENDING_KEY, JSON.stringify(requests));
  };

  const persistNotifications = (notifications: StaffNotification[]) => {
    setStaffNotifications(notifications);
    localStorage.setItem(MPA_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  };

  const getEditorMpas = (userId: string, isStaff: boolean): MPA[] => {
    const active = allMpas.filter((m) => m.status === "active");
    if (!isStaff) return allMpas;

    const staffDrafts = draftMpas;
    const staffPending = boundaryRequests
      .filter(
        (r) =>
          r.status === "pending" &&
          r.submittedBy === userId &&
          (r.action === "create" || r.action === "update"),
      )
      .map((r) => ({ ...r.mpa, status: "review" as const }));

    const merged = new Map<string, MPA>();
    active.forEach((m) => merged.set(m.id, m));
    staffDrafts.forEach((m) => merged.set(m.id, m));
    staffPending.forEach((m) => merged.set(m.id, m));
    return Array.from(merged.values());
  };

  const publishMpa = (mpa: MPA) => {
    const published: MPA = { ...mpa, status: "active" };
    const exists = allMpas.some((m) => m.id === mpa.id);
    const next = exists
      ? allMpas.map((m) => (m.id === mpa.id ? published : m))
      : [...allMpas, published];
    persistStore(next);
    persistDrafts(draftMpas.filter((m) => m.id !== published.id));
  };

  const updateMpaInStore = (mpa: MPA) => {
    persistStore(allMpas.map((m) => (m.id === mpa.id ? mpa : m)));
  };

  const removeMpaFromStore = (mpaId: string) => {
    persistStore(allMpas.filter((m) => m.id !== mpaId));
    persistDrafts(draftMpas.filter((m) => m.id !== mpaId));
  };

  const submitBoundaryRequest = (
    action: MpaRequestAction,
    mpa: MPA,
    previousMpa?: MPA,
  ) => {
    if (!user) return;

    const previewMpa: MPA = {
      ...mpa,
      status: mpa.status === "active" ? "review" : mpa.status,
    };

    const newRequest: MpaBoundaryRequest = {
      id: `mpa-req-${Date.now()}`,
      action,
      mpa: previewMpa,
      previousMpa,
      status: "pending",
      submittedBy: user.id,
      submittedByName: user.name,
      submittedAt: new Date().toISOString(),
    };

    persistPending([...boundaryRequests, newRequest]);

    if (action === "create" || action === "update") {
      const draft = { ...previewMpa, status: "review" as const };
      const exists = draftMpas.some((m) => m.id === draft.id);
      persistDrafts(
        exists
          ? draftMpas.map((m) => (m.id === draft.id ? draft : m))
          : [...draftMpas, draft],
      );
    }
  };

  const saveStaffDraft = (mpa: MPA) => {
    const draft: MPA = {
      ...mpa,
      status: mpa.status === "active" ? "pending" : mpa.status,
    };
    const exists = draftMpas.some((m) => m.id === mpa.id);
    persistDrafts(
      exists
        ? draftMpas.map((m) => (m.id === mpa.id ? draft : m))
        : [...draftMpas, draft],
    );
  };

  const approveBoundaryRequest = (
    requestId: string,
    reviewerId: string,
    reviewerName: string,
  ) => {
    const request = boundaryRequests.find((r) => r.id === requestId);
    if (!request) return;

    let nextMpas = [...allMpas];

    if (request.action === "create" || request.action === "update") {
      const published: MPA = { ...request.mpa, status: "active" };
      const exists = nextMpas.some((m) => m.id === published.id);
      nextMpas = exists
        ? nextMpas.map((m) => (m.id === published.id ? published : m))
        : [...nextMpas, published];
      persistDrafts(draftMpas.filter((m) => m.id !== published.id));
    } else if (request.action === "delete") {
      nextMpas = nextMpas.filter((m) => m.id !== request.mpa.id);
      persistDrafts(draftMpas.filter((m) => m.id !== request.mpa.id));
    }

    persistStore(nextMpas);

    const updatedRequests = boundaryRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "approved" as MpaRequestStatus,
            reviewedBy: reviewerId,
            reviewedByName: reviewerName,
            reviewedAt: new Date().toISOString(),
          }
        : r,
    );
    persistPending(updatedRequests);

    const notification: StaffNotification = {
      id: `notif-${Date.now()}`,
      userId: request.submittedBy,
      message: `Your MPA boundary request for "${request.mpa.name}" was approved. It is now visible on all maps.`,
      mpaName: request.mpa.name,
      type: "approved",
      read: false,
      createdAt: new Date().toISOString(),
    };
    persistNotifications([...staffNotifications, notification]);
  };

  const rejectBoundaryRequest = (
    requestId: string,
    reviewerId: string,
    reviewerName: string,
    reason: string,
  ) => {
    const request = boundaryRequests.find((r) => r.id === requestId);
    if (!request) return;

    if (request.action === "create") {
      persistDrafts(draftMpas.filter((m) => m.id !== request.mpa.id));
    } else if (request.action === "update" && request.previousMpa) {
      const rejectedDrafts = draftMpas.map((m) =>
        m.id === request.mpa.id ? { ...request.previousMpa!, status: request.previousMpa!.status } : m,
      );
      persistDrafts(rejectedDrafts);
    }

    const updatedRequests = boundaryRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "rejected" as MpaRequestStatus,
            reviewedBy: reviewerId,
            reviewedByName: reviewerName,
            reviewedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
        : r,
    );
    persistPending(updatedRequests);

    const notification: StaffNotification = {
      id: `notif-${Date.now()}`,
      userId: request.submittedBy,
      message: `Your MPA boundary request for "${request.mpa.name}" was rejected. Reason: ${reason}`,
      mpaName: request.mpa.name,
      type: "rejected",
      read: false,
      createdAt: new Date().toISOString(),
    };
    persistNotifications([...staffNotifications, notification]);
  };

  const getPendingMpaRequestsCount = () =>
    boundaryRequests.filter((r) => r.status === "pending").length;

  const getNotificationsForUser = (userId: string) =>
    staffNotifications.filter((n) => !n.userId || n.userId === userId);

  const getUnreadNotificationsCount = (userId: string) =>
    getNotificationsForUser(userId).filter((n) => !n.read).length;

  const markNotificationsRead = (userId: string) => {
    persistNotifications(
      staffNotifications.map((n) =>
        !n.userId || n.userId === userId ? { ...n, read: true } : n,
      ),
    );
  };

  return (
    <MpaContext.Provider
      value={{
        allMpas,
        draftMpas,
        activeMpas,
        boundaryRequests,
        staffNotifications,
        getEditorMpas,
        publishMpa,
        updateMpaInStore,
        removeMpaFromStore,
        submitBoundaryRequest,
        approveBoundaryRequest,
        rejectBoundaryRequest,
        getPendingMpaRequestsCount,
        getUnreadNotificationsCount,
        getNotificationsForUser,
        markNotificationsRead,
        saveStaffDraft,
        refreshFromStorage,
      }}
    >
      {children}
    </MpaContext.Provider>
  );
}

export function useMpa() {
  const context = useContext(MpaContext);
  if (context === undefined) {
    throw new Error("useMpa must be used within a MpaProvider");
  }
  return context;
}
