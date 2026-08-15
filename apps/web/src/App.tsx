import { Route, Routes } from "react-router-dom";
import { Auth } from "./pages/features/Auth";
import { Home } from "./pages/features/Home";

export default function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Auth/>}/>
      <Route path="/home" element={<Home/>}/>
    </Routes>
    </>
  );
}
