import { Route, Routes } from "react-router-dom";
import { Auth } from "./pages/features/Auth";
import { Home } from "./pages/features/Home";
import { ProtectedRoute } from "./components/ProtectedRoutes";

export default function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Auth/>}/>
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
    </Routes>
    </>
  );
}
