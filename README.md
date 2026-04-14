# Reliable Group Notification System

![Protocol](https://img.shields.io/badge/Protocol-UDP%20Reliable%20Messaging-1E90FF?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-SSL%20Handshake-228B22?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Transport-Encrypted%20Packets-6A5ACD?style=for-the-badge)
![Reliability](https://img.shields.io/badge/Reliability-ACK%20%2B%20Retransmission-success?style=for-the-badge)
![Heartbeat](https://img.shields.io/badge/Heartbeat-Liveness%20Detection-DC143C?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Pub%2FSub%20Group%20Messaging-FF8C00?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Frontend-Real--time%20Dashboard-8A2BE2?style=for-the-badge)
![Language](https://img.shields.io/badge/Language-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Fault%20Tolerant-brightgreen?style=for-the-badge)

1. Subscribers connect to the server via SSL to get a session key
2. Server sends notifications over UDP to all active subscribers
3. Each subscriber sends an ACK back when they receive a message
4. If no ACK is received within 2 seconds, the server resends the message
5. After 3 failed attempts the server gives up on that subscriber

## Project Structure

```
project/
├── server.py
├── subscriber.py
├── bridge.py
├── frontend.jsx
├── certs/
│   ├── server.crt
│   └── server.key
└── README.md
```

## Setup

### 1. Generate SSL certificates
```bash
mkdir certs
cd certs
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes
cd ..
```

### 2. Install dependencies
```bash
pip install cryptography
```

## Running

Open 3 terminals in the project folder.

**Terminal 1 — Start the server**
```bash
python server.py
```

**Terminal 2 — Start first subscriber**
```bash
python subscriber.py --name "Alpha" --port 5001
```

**Terminal 3 — Start second subscriber**
```bash
python subscriber.py --name "Beta" --port 5002
```

Then type any message in Terminal 1 and press Enter to broadcast it.

## Running on a local network

If you want to run subscribers on different machines connected to the same WiFi, replace `127.0.0.1` with the server machine's IP address.

```bash
python subscriber.py --name "Alpha" --port 5001 --server 192.168.1.x
```

## Features

- Custom packet format with sequence numbers
- SSL handshake for secure session key exchange
- Encrypted UDP packets
- ACK tracking per subscriber
- Automatic retransmission if no ACK received
- Group membership with JOIN and LEAVE packets
- Heartbeat to detect disconnected subscribers
