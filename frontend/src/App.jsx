import { useState, Component } from "react"
import ServerDashboard from "./pages/ServerDashboard"
import SubscriberPage from "./pages/SubscriberPage"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px", color: "#f85149", fontFamily: "monospace",
          background: "#0d1117", minHeight: "100vh"
        }}>
          <h2>Something went wrong</h2>
          <pre style={{ color: "#8b949e", marginTop: "12px", fontSize: "12px" }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "16px", padding: "8px 16px", background: "#21262d",
              border: "1px solid #30363d", color: "#c9d1d9",
              fontFamily: "monospace", cursor: "pointer", borderRadius: "6px"
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const tabStyle = (active) => ({
  background: "none",
  border: "none",
  borderBottom: active ? "2px solid #58a6ff" : "2px solid transparent",
  color: active ? "#58a6ff" : "#8b949e",
  padding: "14px 20px",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: "13px",
  transition: "color 0.15s",
})

export default function App() {
  const [page, setPage] = useState("server")

  return (
    <div style={{ fontFamily: "monospace", background: "#0d1117", minHeight: "100vh", color: "white" }}>
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #30363d", padding: "0 20px" }}>
        <button onClick={() => setPage("server")} style={tabStyle(page === "server")}>
          Server Dashboard
        </button>
        <button onClick={() => setPage("subscriber")} style={tabStyle(page === "subscriber")}>
          Subscriber
        </button>
      </div>

      <ErrorBoundary key={page}>
        {page === "server" ? <ServerDashboard /> : <SubscriberPage />}
      </ErrorBoundary>
    </div>
  )
}