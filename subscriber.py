import socket
import ssl
import threading
import time
import argparse

SERVER_HOST = "127.0.0.1"
SSL_PORT = 8888
UDP_PORT = 9999


def get_key_from_server():
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    secure_sock = context.wrap_socket(sock)
    secure_sock.connect((SERVER_HOST, SSL_PORT))

    key = secure_sock.recv(32)
    secure_sock.close()

    print("Connected to server and got session key")
    return key


def encrypt(data, key):
    return bytes(data[i] ^ key[i % len(key)] for i in range(len(data)))


def send_packet(udp_sock, msg_type, content, key):
    msg = f"{msg_type}|{content}".encode()
    udp_sock.sendto(encrypt(msg, key), (SERVER_HOST, UDP_PORT))


def send_heartbeat(udp_sock, name, key):
    while True:
        time.sleep(3)
        send_packet(udp_sock, "HB", name, key)


def run(name, my_port):
    key = get_key_from_server()

    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_sock.bind(("0.0.0.0", my_port))
    udp_sock.settimeout(1.0)

    send_packet(udp_sock, "JOIN", name, key)
    print(f"Joined as '{name}', waiting for messages...\n")

    threading.Thread(target=send_heartbeat, args=[udp_sock, name, key], daemon=True).start()

    seen = set()

    while True:
        try:
            data, addr = udp_sock.recvfrom(65536)
            text = encrypt(data, key).decode()
            num, message = text.split("|", 1)
            num = int(num)

            if num not in seen:
                seen.add(num)
                print(f"New message #{num}: {message}")

            send_packet(udp_sock, "ACK", str(num), key)

        except socket.timeout:
            continue

        except KeyboardInterrupt:
            send_packet(udp_sock, "LEAVE", name, key)
            print("Left the group")
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", default="Subscriber")
    parser.add_argument("--port", type=int, default=5001)
    args = parser.parse_args()

    run(args.name, args.port)