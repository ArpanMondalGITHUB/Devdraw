import { Route, Routes } from "react-router-dom";
import { Auth } from "./pages/features/auth/Auth";
import { Files } from "./pages/features/canvas/Files";
import { ProtectedRoute } from "./lib/ProtectedRoutes";

export default function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Auth/>}/>
      <Route path="/home" element={<ProtectedRoute><Files /></ProtectedRoute>}/>
    </Routes>
    </>
  );
}
