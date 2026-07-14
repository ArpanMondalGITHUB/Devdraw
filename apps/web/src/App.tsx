import { useEffect, useState } from "react";
import { greet } from "../../../packages/shared/src/utils/greet";

export default function App() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/hello").then(r => r.json()).then(d => setMsg(d.message));
  }, []);
  return (
    <div>
      <h1>{greet("Devdraw")}</h1>
      <p>From API: {msg}</p>
    </div>
  );
}
