import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import ClientDetails from "./components/ClientDetails";
import Sessions from "./components/Sessions";
import WorkingHours from "./components/WorkingHours";
import Chats from "./components/Chats";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "clients", Component: Clients },
      { path: "clients/:id", Component: ClientDetails },
      { path: "sessions", Component: Sessions },
      { path: "working-hours", Component: WorkingHours },
      { path: "chats", Component: Chats },
      { path: "*", Component: NotFound },
    ],
  },
]);