import { useState, useEffect, useRef } from "react"

export default function SubscriberPage() {
  const [name, setName] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const ws = useRef(null)

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765")

    ws.current.onopen = () => setConnected(true)
    ws.current.onclose = () => {
      setConnected(false)
      setSubscribed(false)
    }

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.event === "SEND" && subscribed) {
        setNotifications(prev => [{
          id: data.data.seq,
          message: data.data.message,
          time: new Date().toLocaleTimeString()
        }, ...prev])
      }
    }

    return () => ws.current.close()
  }, [subscribed])

  function subscribe() {
    if (!name.trim() || !connected) return
    ws.current.send(JSON.stringify({ action: "subscribe", name }))
    setSubscribed(true)
  }

  function unsubscribe() {
    ws.current.send(JSON.stringify({ action: "unsubscribe", name }))
    setSubscribed(false)
    setNotifications([])
  }

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#e6edf3", marginBottom: "4px" }}>Subscriber</h2>
      <p style={{ color: "#8b949e", marginTop: "0", marginBottom: "24px", fontSize: "13px" }}>
        Status: {connected
          ? <span style={{ color: "#3fb950" }}>● Connected</span>
          : <span style={{ color: "#f85149" }}>● Not connected — run bridge.py first</span>}
      </p>

      {!subscribed ? (
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "20px" }}>
          <p style={{ color: "#8b949e", fontSize: "12px", marginTop: 0 }}>Enter your name to join the group</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && subscribe()}
              placeholder="Your name..."
              style={{
                flex: 1, background: "#0d1117", border: "1px solid #30363d",
                borderRadius: "6px", padding: "10px 14px", color: "#e6edf3",
                fontFamily: "monospace", fontSize: "13px", outline: "none"
              }}
            />
            <button
              onClick={subscribe}
              disabled={!connected || !name.trim()}
              style={{
                background: connected ? "#238636" : "#21262d",
                border: "1px solid #30363d", borderRadius: "6px",
                padding: "10px 20px", color: "white",
                cursor: connected && name.trim() ? "pointer" : "not-allowed",
                fontFamily: "monospace", fontSize: "13px"
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#3fb950", margin: 0, fontSize: "13px" }}>
              ● Subscribed as <strong>{name}</strong>
            </p>
            <button
              onClick={unsubscribe}
              style={{
                background: "none", border: "1px solid #30363d", borderRadius: "6px",
                padding: "6px 14px", color: "#8b949e", cursor: "pointer",
                fontFamily: "monospace", fontSize: "12px"
              }}
            >
              Leave
            </button>
          </div>

          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "16px" }}>
            <p style={{ color: "#8b949e", fontSize: "11px", margin: "0 0 12px 0" }}>
              NOTIFICATIONS ({notifications.length})
            </p>
            {notifications.length === 0
              ? <p style={{ color: "#484f58", fontSize: "12px" }}>Waiting for notifications...</p>
              : notifications.map((n, i) => (
                <div key={i} style={{
                  padding: "10px 12px", marginBottom: "8px",
                  background: "#0d1117", borderRadius: "6px",
                  borderLeft: "3px solid #58a6ff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#58a6ff", fontSize: "11px" }}>Message #{n.id}</span>
                    <span style={{ color: "#484f58", fontSize: "11px" }}>{n.time}</span>
                  </div>
                  <p style={{ color: "#e6edf3", margin: 0, fontSize: "13px" }}>{n.message}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
