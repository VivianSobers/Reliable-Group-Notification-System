import { useState, useEffect, useRef } from "react"

export default function ServerDashboard() {
  const [message, setMessage] = useState("")
  const [log, setLog] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [connected, setConnected] = useState(false)
  const ws = useRef(null)

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765")

    ws.current.onopen = () => {
      setConnected(true)
      addLog("Connected to server", "#58a6ff")
    }

    ws.current.onclose = () => {
      setConnected(false)
      addLog("Disconnected from server", "#f85149")
    }

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.event === "JOIN") {
        setSubscribers(prev => [...prev, data.data.name])
        addLog(`${data.data.name} joined the group`, "#3fb950")
      }

      if (data.event === "LEAVE") {
        setSubscribers(prev => prev.filter(s => s !== data.data.name))
        addLog(`${data.data.name} left the group`, "#8b949e")
      }

      if (data.event === "SEND") {
        addLog(`Sent #${data.data.seq}: "${data.data.message}" to ${data.data.targets.join(", ")}`, "#e3b341")
      }

      if (data.event === "ACK") {
        addLog(`${data.data.subscriber} got message #${data.data.seq} in ${data.data.latency}ms`, "#3fb950")
      }

      if (data.event === "RTX") {
        addLog(`Resending #${data.data.seq} to ${data.data.subscriber} (attempt ${data.data.attempt})`, "#e3b341")
      }

      if (data.event === "DROP") {
        addLog(`Gave up on ${data.data.subscriber} for message #${data.data.seq}`, "#f85149")
      }

      if (data.event === "COMPLETE") {
        addLog(`Everyone got message #${data.data.seq}!`, "#3fb950")
      }
    }

    return () => ws.current.close()
  }, [])

  function addLog(text, color) {
    const time = new Date().toLocaleTimeString()
    setLog(prev => [{ text, color, time }, ...prev].slice(0, 100))
  }

  function sendMessage() {
    if (!message.trim() || !connected) return
    ws.current.send(JSON.stringify({ action: "send_notification", payload: message }))
    setMessage("")
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#e6edf3", marginBottom: "4px" }}>Server Dashboard</h2>
      <p style={{ color: "#8b949e", marginTop: "0", marginBottom: "24px", fontSize: "13px" }}>
        Status: {connected
          ? <span style={{ color: "#3fb950" }}>● Connected to bridge</span>
          : <span style={{ color: "#f85149" }}>● Not connected — run bridge.py first</span>}
      </p>

      {/* Send message */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a notification to broadcast..."
          style={{
            flex: 1, background: "#161b22", border: "1px solid #30363d",
            borderRadius: "6px", padding: "10px 14px", color: "#e6edf3",
            fontFamily: "monospace", fontSize: "13px", outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          style={{
            background: connected ? "#238636" : "#21262d",
            border: "1px solid #30363d", borderRadius: "6px",
            padding: "10px 20px", color: "white", cursor: connected ? "pointer" : "not-allowed",
            fontFamily: "monospace", fontSize: "13px"
          }}
        >
          Send
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
        {/* Subscribers */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "16px" }}>
          <p style={{ color: "#8b949e", fontSize: "11px", margin: "0 0 12px 0" }}>
            SUBSCRIBERS ({subscribers.length})
          </p>
          {subscribers.length === 0
            ? <p style={{ color: "#484f58", fontSize: "12px" }}>Nobody connected yet</p>
            : subscribers.map((name, i) => (
              <div key={i} style={{ color: "#e6edf3", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #21262d" }}>
                <span style={{ color: "#3fb950", marginRight: "8px" }}>●</span>{name}
              </div>
            ))
          }
        </div>

        {/* Event log */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "16px" }}>
          <p style={{ color: "#8b949e", fontSize: "11px", margin: "0 0 12px 0" }}>EVENT LOG</p>
          <div style={{ height: "300px", overflowY: "auto" }}>
            {log.length === 0
              ? <p style={{ color: "#484f58", fontSize: "12px" }}>No events yet</p>
              : log.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "4px 0", borderBottom: "1px solid #21262d" }}>
                  <span style={{ color: "#484f58", fontSize: "11px", minWidth: "70px" }}>{entry.time}</span>
                  <span style={{ color: entry.color, fontSize: "12px" }}>{entry.text}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
