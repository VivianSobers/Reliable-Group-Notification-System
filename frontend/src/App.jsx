import { useState } from "react"
import ServerDashboard from "./pages/ServerDashboard"
import SubscriberPage from "./pages/SubscriberPage"

export default function App() {
  const [page, setPage] = useState("server")

  return (
    <div style={{ fontFamily: "monospace", background: "#0d1117", minHeight: "100vh", color: "white" }}>
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #30363d", padding: "0 20px" }}>
        <button
          onClick={() => setPage("server")}
          style={{
            background: "none", border: "none",
            borderBottom: page === "server" ? "2px solid #58a6ff" : "2px solid transparent",
            color: page === "server" ? "#58a6ff" : "#8b949e",
            padding: "14px 20px", cursor: "pointer",
            fontFamily: "monospace", fontSize: "13px"
          }}
        >
          Server Dashboard
        </button>
        <button
          onClick={() => setPage("subscriber")}
          style={{
            background: "none", border: "none",
            borderBottom: page === "subscriber" ? "2px solid #58a6ff" : "2px solid transparent",
            color: page === "subscriber" ? "#58a6ff" : "#8b949e",
            padding: "14px 20px", cursor: "pointer",
            fontFamily: "monospace", fontSize: "13px"
          }}
        >
          Subscriber
        </button>
      </div>

      {page === "server" ? <ServerDashboard /> : <SubscriberPage />}
    </div>
  )
}