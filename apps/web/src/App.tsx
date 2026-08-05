import { Route, Routes } from "react-router-dom";
import { Auth } from "./pages/features/Auth";

export default function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Auth/>}/>
    </Routes>
    </>
  );
}
