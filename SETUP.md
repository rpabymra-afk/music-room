# Music Room - Setup & Run

## Quick Start (Local Development)

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open browser to: http://localhost:3000

## Development Mode

For auto-reload on file changes:
```bash
npm run dev
```

## Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment guide.

**Quick Deploy**:
```bash
vercel
vercel --prod
```

## Environment Variables

Create a `.env` file in the root directory (optional):
```
PORT=3000
NODE_ENV=development
```

## Dependencies

The following will be installed:
- express (v4.18.2) - Web server
- socket.io (v4.6.1) - Real-time communication
- cors (v2.8.5) - Cross-origin resource sharing
- uuid (v9.0.0) - Unique ID generation

## Troubleshooting

### Port Already in Use
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force
npm install
```
