# Selective Sync Web App

A modern web application to sync folders from a remote server to your local file system via SSH/SFTP. Features a premium UI, job queuing, scheduling, and connection resiliency.

## Features

- **Remote Browser**: Browse your remote server via SSH.
- **Selective Sync**: Choose specific files or folders to sync.
- **Job Queue**: Monitor sync progress, reorder priority, and view history.
- **Resiliency**: Auto-retries, connection checks, and clean error handling.
- **Scheduling**: Automatic hourly sync checks (remote takes precedence).
- **Configuration**: securely store credentials (encrypted).

## Quick Start (Docker)

1. **Edit `docker-compose.yml`**:
   - Set a secure `ENCRYPTION_KEY`.
   - Mount your local directories to the container (e.g., `- ~/Downloads:/sync/Downloads`) so that the app can write files to your actual host system.

2. **Run**:
   ```bash
   docker-compose up -d --build
   ```

3. **Open**: [http://localhost:3001](http://localhost:3001)

## Development

### Prerequisites
- Node.js 18+
- SQLite3

### Setup

1. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Run Backend** (Port 3001):
   ```bash
   cd server
   # Create a .env file with ENCRYPTION_KEY=...
   npm run dev
   ```

3. **Run Frontend** (Port 5173 - proxies to 3001):
   ```bash
   cd client
   npm run dev
   ```

### Development with Docker (Hot Reload)

To run the full stack in development mode with hot reloading (no rebuilds required):

```bash
docker-compose -f docker-compose.dev.yml up
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

Changes to files in `server/` or `client/` will automatically trigger updates.

## Configuration

- **Encryption**: Credentials are encrypted using AES-256-CBC with the key provided in `ENCRYPTION_KEY`.
- **Sync Logic**: Remote files always take precedence. If a file changes remotely, it is re-downloaded. Local deletions are respected (sync stops if local target is missing) unless re-enabled.

## Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Premium Design).
- **Backend**: Node.js, Express, Better-SQLite3, SSH2.
