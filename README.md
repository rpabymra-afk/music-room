# 🎵 Music Room - Real-Time Music Streaming Application

**🚀 Live Demo:** https://music-room-rj9k.onrender.com

A responsive web application that allows users to create or join music rooms and stream audio in real-time to all participants. Built with WebRTC and WebSocket technology for low-latency, synchronized audio streaming.

## ✨ Features

### Authentication & Room Access
- **Secret Key System**: Users create or join rooms using a unique secret key
- **Alias Names**: Display names for users within rooms
- **Auto Admin Assignment**: First user to join automatically becomes the admin
- **Multi-User Support**: Multiple users can join the same room with different aliases

### Roles & Permissions
- **Admin Capabilities**:
  - Stream audio from any device/application (Spotify, YouTube, local media, etc.)
  - Control playback (start/stop streaming)
  - Transfer admin role to other users
  
- **Co-Admin Support**: 
  - Assigned admins have same streaming capabilities
  - Can control playback
  
- **Listener Role**:
  - Receive and listen to audio streams
  - View room information and user list

### Music Streaming
- **Real-Time Audio Streaming**: WebRTC-based peer-to-peer audio transmission
- **Synchronized Playback**: All users hear the same audio simultaneously
- **Dynamic Source Switching**: Automatically switches when admin changes source
- **Single Active Stream**: Only one audio stream plays at a time per room

### User Experience
- **Live User List**: Shows all connected users with their roles
- **Real-Time Updates**: Join/leave events handled gracefully
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Volume Control**: Individual volume adjustment for listeners
- **Visual Feedback**: Status indicators for streaming, connection, and user actions

## 🏗️ Architecture

### Frontend
- **HTML5**: Semantic markup with responsive design
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No framework dependencies
- **WebRTC**: Peer-to-peer audio streaming
- **Socket.IO Client**: Real-time bidirectional communication

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **Socket.IO**: WebSocket server for real-time communication
- **Room Management System**: Custom room and user management

### Communication Flow

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Admin     │          │   Server    │          │  Listener   │
│   (Stream)  │          │  (Signaling)│          │  (Receive)  │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       │  1. Start Streaming    │                        │
       ├───────────────────────>│                        │
       │                        │  2. Notify Streaming   │
       │                        ├───────────────────────>│
       │                        │                        │
       │         3. WebRTC Offer (Peer-to-Peer)         │
       │<──────────────────────────────────────────────>│
       │                        │                        │
       │         4. Audio Stream (Direct P2P)           │
       │=========================================>│
       │                        │                        │
```

## 🎵 How Music Streaming Works

### Audio Capture
The application uses the **Web Audio API** and **MediaStream API** to capture audio:

1. **Admin/Streamer Side**:
   ```javascript
   // Request microphone/system audio access
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   ```
   
2. **WebRTC Connection**:
   - Creates RTCPeerConnection for each listener
   - Adds audio tracks to the connection
   - Establishes peer-to-peer connection

3. **Listener Side**:
   - Receives WebRTC offer from admin
   - Establishes connection
   - Receives audio stream directly via WebRTC
   - Plays audio through HTML5 audio element

### Audio Sources
- **Mobile Devices**: Capture system audio or microphone
- **Desktop**: Capture microphone or system audio (with appropriate permissions)
- **Any Application**: Stream from Spotify, YouTube, local media players, etc.

### Synchronization
- WebRTC provides near-real-time latency (typically 100-300ms)
- Socket.IO handles signaling and state synchronization
- All listeners receive the same stream from the admin

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support

### Local Development

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\Project\MusicPlayStore
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open your browser and go to: `http://localhost:3000`
   - The server will serve the frontend automatically

### Deploy to Vercel

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

**Quick Deploy**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

⚠️ **Note**: Vercel has WebSocket limitations. For production, consider **Railway**, **Render**, or **Heroku** for better WebSocket support.

### Configuration

The server runs on port 3000 by default. To change the port:

```bash
PORT=8080 npm start
```

Or set it in the code ([backend/server.js](backend/server.js)):
```javascript
const PORT = process.env.PORT || 3000;
```

## 🚀 Usage Guide

### Creating a Room

1. Open the application in your browser
2. Enter a **Secret Key** (any text - this will be your room ID)
3. Enter your **Alias** (display name)
4. Click "Join Room"
5. You are now the **Admin** of this room

### Joining an Existing Room

1. Get the **Secret Key** from the room admin
2. Enter the same **Secret Key**
3. Enter a unique **Alias** (different from existing users)
4. Click "Join Room"
5. You join as a **Listener**

### Streaming Music (Admin)

1. Click "Start Streaming" button
2. Allow microphone/audio access when prompted
3. Play music from any application on your device:
   - Spotify
   - YouTube
   - Local media player
   - Any audio source
4. Music will stream to all users in the room
5. Click "Stop Streaming" to stop

### Transferring Admin Role

1. As admin, click "Make Admin" button next to any user
2. Confirm the transfer
3. The selected user becomes the new admin
4. You become a co-admin (can still stream)

### Listening to Music

1. Join a room as a listener
2. When admin starts streaming, music plays automatically
3. Adjust volume using the volume slider
4. See who is currently streaming in the "Now Playing" section

## 🔒 Security Features

- **Secret Key Hashing**: Room keys are hashed using SHA-256
- **No Authentication Required**: No third-party login needed
- **Secure WebRTC**: Peer-to-peer encryption via DTLS-SRTP
- **STUN Servers**: Google's public STUN servers for NAT traversal
- **Session Management**: Credentials stored in sessionStorage (cleared on tab close)

## 📱 Mobile Support

The application is fully responsive and supports:

- **iOS**: Safari, Chrome
- **Android**: Chrome, Firefox, Edge
- **Tablets**: All major browsers
- **Desktop**: All modern browsers

### Mobile Considerations

- **Microphone Permissions**: Required for streaming
- **Background Audio**: May pause when app is in background (browser limitation)
- **Screen Audio Capture**: Limited on mobile browsers
- **Best Practice**: Use device speakers or an audio cable to capture music from other apps

## 🛠️ Technical Details

### WebRTC Configuration

```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

### Socket.IO Events

**Client to Server**:
- `join-room`: Join or create a room
- `start-streaming`: Start audio streaming
- `stop-streaming`: Stop audio streaming
- `transfer-admin`: Transfer admin role
- `offer/answer/ice-candidate`: WebRTC signaling

**Server to Client**:
- `room-joined`: Confirmation of room join
- `user-joined`: New user joined notification
- `user-left`: User left notification
- `streaming-started`: Admin started streaming
- `streaming-stopped`: Streaming stopped
- `admin-transferred`: Admin role transferred

### File Structure

```
MusicPlayStore/
├── backend/
│   ├── server.js           # Express & Socket.IO server
│   ├── roomManager.js      # Room and user management
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── index.html          # Landing/join page
│   ├── room.html           # Room interface
│   ├── css/
│   │   └── style.css       # All styles
│   └── js/
│       ├── join.js         # Join page logic
│       └── room.js         # Room page & WebRTC logic
└── README.md               # This file
```

## 🎯 Optional Enhancements (Implemented)

- ✅ Real-time user list with roles
- ✅ Admin transfer functionality
- ✅ Volume control for listeners
- ✅ Responsive design for mobile and desktop
- ✅ Visual streaming indicators
- ✅ Graceful handling of disconnections

## 🎯 Optional Enhancements (Future)

- ⬜ Mute/unmute for listeners
- ⬜ Room expiration or auto-cleanup
- ⬜ Text chat inside the music room
- ⬜ QR code generator for easy room joining
- ⬜ Playlist management
- ⬜ Recording functionality
- ⬜ TURN server for better connectivity

## � Deployment

### ⚠️ Important: Vercel Limitations
This app uses WebSockets for real-time audio streaming. **Vercel has a 5-minute WebSocket timeout**, which will disconnect users during music sessions.

### 🎯 Recommended Hosting (Production-Ready)

For unlimited WebSocket connections and no timeouts:

#### **Option 1: Railway.app** ⭐ (Recommended)
- ✅ $5 free credit per month
- ✅ No WebSocket timeouts
- ✅ No cold starts
- ✅ One-command deploy

**Quick Deploy:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

📖 **Full Guide**: [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)

#### **Option 2: Render.com** (Free Forever)
- ✅ 750 hours/month free
- ✅ WebSocket support
- ✅ Auto-deploy from GitHub

📖 **Full Guide**: [HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md)

#### **Option 3: Fly.io** (Best Performance)
- ✅ 3 free VMs
- ✅ Global edge deployment
- ✅ True persistent containers

📖 **Setup Guide**: See [HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md#3--flyio-very-good)

### 📋 Complete Hosting Comparison
For detailed comparison of 8+ hosting options, features, pricing, and migration guides:
→ **[HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md)**

### 🐳 Docker Deployment
```bash
docker build -t music-room .
docker run -p 3000:3000 music-room
```

Files included:
- `Dockerfile` - Production-ready container
- `.dockerignore` - Optimized build
- `railway.json` - Railway configuration
- `render.yaml` - Render configuration

## �🐛 Troubleshooting

### Audio Not Streaming

1. **Check Permissions**: Ensure microphone access is granted
2. **Browser Support**: Use Chrome, Firefox, or Safari (latest versions)
3. **HTTPS**: For production, use HTTPS (WebRTC requirement)
4. **Firewall**: Check firewall settings for WebRTC traffic

### Connection Issues

1. **Server Running**: Ensure backend server is running
2. **Port Conflicts**: Check if port 3000 is available
3. **Network**: Ensure devices are on the same network or internet-connected
4. **STUN/TURN**: For restrictive networks, configure TURN servers

### Mobile-Specific Issues

1. **Background Playback**: Keep browser tab active
2. **Battery Saver**: Disable battery optimization for browser
3. **Permissions**: Check app permissions in device settings

## 📝 Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅      | ✅     | Recommended |
| Firefox | ✅      | ✅     | Full support |
| Safari  | ✅      | ✅     | iOS 11+ |
| Edge    | ✅      | ✅     | Chromium-based |
| Opera   | ✅      | ✅     | Chromium-based |

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 👥 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using WebRTC, Socket.IO, and modern web technologies**
