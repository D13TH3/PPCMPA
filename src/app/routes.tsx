import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { MapEditor } from "./pages/MapEditor";
import { EcosystemInventory } from "./pages/EcosystemInventory";
import { ManagementEffectiveness } from "./pages/ManagementEffectiveness";
import { Reports } from "./pages/Reports";
import { Ordinances } from "./pages/Ordinances";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { AccessDenied } from "./pages/AccessDenied";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminApprovals from "./pages/AdminApprovals";
import PublicData from "./pages/PublicData";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import FieldIncidentLog from "./pages/FieldIncidentLog";
import UserManagement from "./pages/UserManagement";
import SystemSettings from "./pages/SystemSettings";
import AuditLogs from "./pages/AuditLogs";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import PublicMapViewer from "./pages/PublicMapViewer";
import PublicMapViewerPage from "./pages/PublicMapViewerPage";
import InformationHub from "./pages/InformationHub";
import IncomingReports from "./pages/IncomingReports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/view-map",
    Component: PublicMapViewer,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/access-denied",
    Component: AccessDenied,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      {
        path: "map",
        element: (
          <ProtectedRoute requiredRole="staff">
            <MapEditor />
          </ProtectedRoute>
        )
      },
      { path: "ecosystem", Component: EcosystemInventory },
      { path: "effectiveness", Component: ManagementEffectiveness },
      { path: "reports", Component: Reports },
      {
        path: "ordinances",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Ordinances />
          </ProtectedRoute>
        )
      },
      {
        path: "admin-approvals",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminApprovals />
          </ProtectedRoute>
        )
      },
      { path: "public-data", Component: PublicData },
      {
        path: "report-issue",
        element: (
          <ProtectedRoute requiredRole="public">
            <ReportIssue />
          </ProtectedRoute>
        )
      },
      {
        path: "my-reports",
        element: (
          <ProtectedRoute requiredRole="public">
            <MyReports />
          </ProtectedRoute>
        )
      },
      {
        path: "map-viewer",
        element: (
          <ProtectedRoute>
            <PublicMapViewerPage />
          </ProtectedRoute>
        )
      },
      {
        path: "information-hub",
        element: (
          <ProtectedRoute requiredRole="public">
            <InformationHub />
          </ProtectedRoute>
        )
      },
      {
        path: "field-incident-log",
        element: (
          <ProtectedRoute requiredRole="staff">
            <FieldIncidentLog />
          </ProtectedRoute>
        )
      },
      {
        path: "incoming-reports",
        element: (
          <ProtectedRoute requiredRole="staff">
            <IncomingReports />
          </ProtectedRoute>
        )
      },
      {
        path: "user-management",
        element: (
          <ProtectedRoute requiredRole="system_admin">
            <UserManagement />
          </ProtectedRoute>
        )
      },
      {
        path: "system-settings",
        element: (
          <ProtectedRoute requiredRole="system_admin">
            <SystemSettings />
          </ProtectedRoute>
        )
      },
      {
        path: "audit-logs",
        element: (
          <ProtectedRoute requiredRole="system_admin">
            <AuditLogs />
          </ProtectedRoute>
        )
      },
      { path: "profile", Component: Profile },
    ],
  },
]);