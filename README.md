# Reliable Group Notification System

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