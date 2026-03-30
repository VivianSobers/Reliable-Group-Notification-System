import socket
import ssl
import threading
import time
import os

UDP_PORT = 9999
SSL_PORT = 8888
SECRET_KEY = os.urandom(32)

subscribers = {}
messages_sent = {}
seq = 0
udp_sock = None
event_callback = None


def emit(event_type, data):
    if event_callback:
        event_callback({"event": event_type, "data": data})


def encrypt(data):
    return bytes(data[i] ^ SECRET_KEY[i % len(SECRET_KEY)] for i in range(len(data)))


def ssl_handshake_server():
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("certs/server.crt", "certs/server.key")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("0.0.0.0", SSL_PORT))
    server.listen(5)
    print("Waiting for subscribers to connect via SSL...")
    while True:
        conn, addr = server.accept()
        secure_conn = context.wrap_socket(conn, server_side=True)
        secure_conn.sendall(SECRET_KEY)
        secure_conn.close()
        print(f"Gave session key to {addr[0]}")


def send_to_everyone(sock, message):
    global seq
    seq += 1
    data = encrypt(f"{seq}|{message}".encode())
    messages_sent[seq] = {
        "data": data,
        "acks": set(),
        "targets": list(subscribers.keys()),
        "time": time.time(),
        "retries": {}
    }
    print(f"Sending message #{seq} to {list(subscribers.values())}")
    emit("SEND", {"seq": seq, "message": message, "targets": list(subscribers.values())})
    for addr in list(subscribers.keys()):
        sock.sendto(data, addr)
        threading.Timer(2.0, check_ack, args=[sock, seq, addr]).start()


def check_ack(sock, seq_num, addr):
    msg = messages_sent.get(seq_num)
    if not msg or addr in msg["acks"]:
        return
    retries = msg["retries"].get(addr, 0)
    name = subscribers.get(addr, str(addr))
    if retries >= 3:
        print(f"Gave up sending to {name}")
        emit("DROP", {"seq": seq_num, "subscriber": name})
        return
    msg["retries"][addr] = retries + 1
    print(f"Resending to {name}, attempt {retries + 1}")
    emit("RTX", {"seq": seq_num, "subscriber": name, "attempt": retries + 1})
    sock.sendto(msg["data"], addr)
    threading.Timer(2.0, check_ack, args=[sock, seq_num, addr]).start()


def handle_incoming(sock, data, addr):
    text = encrypt(data).decode()
    parts = text.split("|")

    if parts[0] == "JOIN":
        subscribers[addr] = parts[1]
        print(f"{parts[1]} joined the group")
        emit("JOIN", {"name": parts[1], "addr": f"{addr[0]}:{addr[1]}", "total": len(subscribers)})

    elif parts[0] == "LEAVE":
        name = subscribers.pop(addr, "someone")
        print(f"{name} left the group")
        emit("LEAVE", {"name": name, "total": len(subscribers)})

    elif parts[0] == "ACK":
        num = int(parts[1])
        name = subscribers.get(addr, str(addr))
        msg = messages_sent.get(num)
        if msg and addr not in msg["acks"]:
            msg["acks"].add(addr)
            ms = round((time.time() - msg["time"]) * 1000)
            print(f"{name} got message #{num} in {ms}ms")
            emit("ACK", {"seq": num, "subscriber": name, "latency": ms})
            if set(msg["targets"]) == msg["acks"]:
                print(f"Everyone got message #{num}!")
                emit("COMPLETE", {"seq": num})
                del messages_sent[num]


def listen_for_packets(sock):
    while True:
        data, addr = sock.recvfrom(65536)
        threading.Thread(target=handle_incoming, args=[sock, data, addr]).start()


if __name__ == "__main__":
    threading.Thread(target=ssl_handshake_server, daemon=True).start()
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.bind(("0.0.0.0", UDP_PORT))
    threading.Thread(target=listen_for_packets, args=[udp_sock], daemon=True).start()
    print(f"Server running on port {UDP_PORT}")
    print("Type a message to send to everyone\n")
    while True:
        msg = input(">> ")
        if msg.strip():
            send_to_everyone(udp_sock, msg.strip())