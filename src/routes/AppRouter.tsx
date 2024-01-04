import React from "react";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LoginPage from "../components/pages/auth/Login";
import ErrorPage404 from "../components/pages/auth/404";

import { LAST_PATH } from "../utils/constants";
import HomePage from "../components/pages/Home";
import FamiliesPage from "../components/pages/Families";
import InvitationPage from "../components/pages/Invitation";

import {
  authStatus,
  useAuthContext,
  AuthProvider,
} from "../context/AuthContext";

import firebase, { FirebaseContext } from "../firebase";

interface RequireAuthProps {
  isAllowed: boolean;
  children?: React.ReactNode;
  redirectTo?: string;
}

function RequireAuth({
  isAllowed,
  children,
  redirectTo = "/auth/login",
}: RequireAuthProps) {
  if (!isAllowed) {
    return <Navigate to={redirectTo} />;
  }

  return <AdminLayout>{children ? children : <Outlet />}</AdminLayout>;
}

const AppRouter = () => {
  const context = useAuthContext();

  const { status, user } = context || {};

  const navigate = useNavigate();
  React.useEffect(() => {
    if (status === authStatus.Ready) {
      if (!window.location.href.includes("/invitacion/")) {
        if (!user) {
          navigate("/auth/login", { replace: true });
        } else {
          const PATH = sessionStorage.getItem(LAST_PATH) || "/dashboard";
          navigate(PATH, { replace: true });
        }
      }
    }
  }, [status]);

  return (
    <>
      <Routes>
        <Route element={<RequireAuth isAllowed={!!user} />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/familias" element={<FamiliesPage />} />
        </Route>

        <Route path="/invitacion/:id" element={<InvitationPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/404" element={<ErrorPage404 />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth/404" replace />} />
      </Routes>
      <Toaster />
    </>
  );
};

export const AppRouterComponentContainer = () => (
  <Router>
    <FirebaseContainer>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </FirebaseContainer>
  </Router>
);

const FirebaseContainer = ({ children }: { children?: React.ReactNode }) => (
  <FirebaseContext.Provider value={{ firebase }}>
    {children ? children : <Outlet />}
  </FirebaseContext.Provider>
);
