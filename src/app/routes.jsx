import { createBrowserRouter } from "react-router";
import { AppLayout, PublicLayout, RequireAuth } from "./components";
import Landing from "./pages/Landing";
import { Login, Register, ForgotPassword, ResetPassword } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import MapPage from "./pages/Map";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "map", Component: MapPage },
      {
        Component: RequireAuth,
        children: [
          { path: "history", Component: History },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
]);
