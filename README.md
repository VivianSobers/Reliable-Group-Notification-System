# UDP Reliable Group Notification System

A from-scratch implementation of reliable message delivery 
over UDP — without using TCP.

## What it does
- Sends real-time alerts to multiple subscribers simultaneously
- Detects lost packets using sequence numbers and ACK tracking
- Automatically retransmits to subscribers who didn't respond
- Manages group membership with JOIN/LEAVE/Heartbeat packets
- Compares reliable UDP vs best-effort UDP delivery side by side

## Why it's interesting
UDP is fast but unreliable by design. This project builds a 
custom reliability layer on top of raw UDP sockets — similar 
to how real-world systems like game servers, stock feeds, and 
IoT platforms handle delivery guarantees without the overhead 
of TCP.

## Tech Stack
- Backend  → Python (raw UDP sockets)
- Bridge   → Python WebSocket server
- Frontend → React (live dashboard)

## Key Concepts Demonstrated
- Custom binary packet format (TYPE | SEQ | GROUP | TIMESTAMP | PAYLOAD | CHECKSUM)
- Per-subscriber ACK tracking with timeout-based retransmission
- Group membership management (JOIN / LEAVE / Heartbeat)
- Performance comparison: reliable vs best-effort delivery rates
```

---

**GitHub repo tags** (add these as topics on your repo):
```
udp  socket-programming  networking  python  
react  real-time  reliable-messaging  computer-networks