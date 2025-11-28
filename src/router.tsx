import { createBrowserRouter } from "react-router";
import Homepage from "@/pages/Homepage";
import Rooms from "@/pages/Rooms";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/rooms",
    element: <Rooms />,
  },
  {
    path: "/rooms/:roomId",
    element: <Room />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
