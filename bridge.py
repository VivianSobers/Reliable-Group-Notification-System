import asyncio
import websockets
import json
import threading
import queue
import socket

event_queue = queue.Queue()
connected_clients = set()

def queue_event(event):
    event_queue.put(event)

async def handler(websocket):
    connected_clients.add(websocket)
    print(f"Frontend connected ({len(connected_clients)} total)")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("action") == "send_notification":
                import server
                udp_sock = server.udp_sock
                server.send_to_everyone(udp_sock, data.get("payload", ""))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"Frontend disconnected ({len(connected_clients)} remaining)")

async def broadcast_events():
    while True:
        while not event_queue.empty():
            event = event_queue.get_nowait()
            dead = set()
            for client in connected_clients.copy():
                try:
                    await client.send(json.dumps(event))
                except Exception:
                    dead.add(client)
            connected_clients -= dead
        await asyncio.sleep(0.05)

async def main():
    print("Bridge running on ws://localhost:8765")
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await broadcast_events()

if __name__ == "__main__":
    import server
    server.event_callback = queue_event
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    udp_sock.bind(("0.0.0.0", server.UDP_PORT))
    server.udp_sock = udp_sock
    threading.Thread(target=server.ssl_handshake_server, daemon=True).start()
    threading.Thread(target=server.listen_for_packets, args=[udp_sock], daemon=True).start()
    asyncio.run(main())