# LiveKit Video Chat Demo

A real-time video calling application using LiveKit, demonstrating peer-to-peer video and audio communication between two devices on a local network.

## Features

- 🎥 Real-time video streaming
- 🎤 Audio communication
- 📱 Mobile-friendly responsive design
- 🔒 Secure HTTPS/WSS connections with self-signed certificates
- 👥 Participant tracking and status display
- 🎨 Modern, gradient UI design

## Architecture

- **Frontend**: Vite + TypeScript + LiveKit Client SDK
- **Backend**: Deno server for JWT token generation
- **LiveKit Server**: Docker container for WebRTC signaling and media routing
- **Caddy**: Reverse proxy for TLS termination on LiveKit WebSocket connections

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Deno](https://deno.land/) (v1.38+)
- [Docker](https://www.docker.com/) and Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) for generating local SSL certificates
- [Caddy](https://caddyserver.com/) web server

### Installation

**macOS:**
```bash
# Node.js
brew install node

# Deno
brew install deno

# Docker
# Download from https://www.docker.com/products/docker-desktop

# mkcert
brew install mkcert

# Caddy
brew install caddy
```

**Linux:**
```bash
# Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Deno
curl -fsSL https://deno.land/install.sh | sh

# Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# mkcert
sudo apt install libnss3-tools
brew install mkcert  # or download from GitHub releases

# Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**Windows:**
```powershell
# Use Chocolatey package manager
choco install nodejs deno docker-desktop mkcert caddy
```

## Setup Instructions

### 1. Install mkcert and Generate Certificates

```bash
# Install mkcert (macOS)
brew install mkcert

# Install the local CA
mkcert -install

# Generate certificates for your local IP
# Replace 192.168.2.65 with your actual local IP address
mkcert 192.168.2.65

# Move certificates to the certs directory
mkdir -p certs
mv 192.168.2.65*.pem certs/
```

> **Note**: To find your local IP on macOS, run: `ipconfig getifaddr en0`

### 2. Update Configuration

If your local IP is different from `192.168.2.65`, update these files:

- `frontend/src/main.ts`: Update `backendUrl` and `livekitUrl`
- `backend/main.ts`: Update the console log message
- `Caddyfile`: Update the bind address

### 3. Start the Services

Open 4 terminal windows and run each command:

#### Terminal 1: LiveKit Server
```bash
cd docker
docker-compose up
```

#### Terminal 2: Caddy Proxy
```bash
sudo caddy run
```

#### Terminal 3: Backend
```bash
cd backend
deno task dev
```

#### Terminal 4: Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

1. On your **laptop**, open: `https://192.168.2.65:5173` (replace with your IP)
2. On your **phone** (connected to same WiFi), open: `https://192.168.2.65:5173`
3. Accept the self-signed certificate warning on both devices
4. Enter **different usernames** on each device (e.g., "laptop" and "phone")
5. Click "Join Room" on both devices

## Usage

1. **Enter Username**: Each participant must use a unique username
2. **Join Room**: Click to connect and enable camera/microphone
3. **Video Call**: Once both participants join, video and audio will stream automatically
4. **Leave Room**: Click "Leave Room" to disconnect

## Port Configuration

- Frontend (Vite): `5173` (HTTPS)
- Backend (Deno): `3001` (HTTPS)
- LiveKit: `7880` (WSS via Caddy) → `7881` (WS in Docker)
- Redis: `6379` (internal to Docker network)

## Troubleshooting

### Camera/Microphone Not Working

- Ensure you're accessing via HTTPS (not HTTP)
- Check browser permissions for camera/microphone
- Make sure you accepted the self-signed certificate

### Connection Issues

- Verify all 4 services are running (LiveKit, Caddy, Backend, Frontend)
- Check that both devices are on the same WiFi network
- Ensure firewall isn't blocking ports 5173, 3001, or 7880
- Look at browser console logs for specific errors

### Participants Disconnecting Each Other

- Make sure each device uses a **different username**
- LiveKit automatically disconnects duplicate identities

### Certificate Errors

- Re-run `mkcert -install` if certificates aren't trusted
- Regenerate certificates if you changed your IP address
- Ensure certificate files exist in `certs/` directory

## Project Structure

```
.
├── backend/               # Deno token server
│   ├── main.ts           # HTTP server with CORS
│   ├── routes/token.ts   # JWT token generation
│   └── deno.json         # Deno configuration
├── frontend/             # Vite + TypeScript app
│   ├── src/
│   │   ├── main.ts      # LiveKit client logic
│   │   └── styles.css   # UI styling
│   ├── index.html       # HTML structure
│   └── vite.config.ts   # HTTPS configuration
├── docker/              # LiveKit Docker setup
│   ├── docker-compose.yml
│   └── livekit.yaml     # LiveKit configuration
├── certs/               # SSL certificates
│   ├── 192.168.2.65.pem
│   └── 192.168.2.65-key.pem
└── Caddyfile           # Caddy reverse proxy config
```

## Technology Stack

- **LiveKit**: WebRTC SFU for real-time video/audio
- **TypeScript**: Type-safe frontend and backend code
- **Vite**: Fast frontend build tool
- **Deno**: Secure TypeScript runtime for backend
- **Docker**: Containerized LiveKit server
- **Caddy**: Modern web server with automatic HTTPS

## Environment Variables

You need to create `.env` files in **both** directories with the following variables:

### `backend/.env`
```env
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
BACKEND_PORT=3001
```

### `docker/.env`
```env
LIVEKIT_API_KEY=your-api-key-here
LIVEKIT_API_SECRET=your-api-secret-here
```

> **Note**: You can generate API keys in the LiveKit config or use any secure random strings for local development. Both `.env` files should have the **same API key and secret** values.

## Development Notes

- The app uses self-signed certificates for local development
- Production deployments should use proper SSL certificates
- LiveKit requires TLS for WebSocket connections
- Caddy provides TLS termination for the LiveKit server

## License

MIT
