const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const RoomManager = require('./roomManager');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // 100 MB for audio chunks
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const roomManager = new RoomManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join or create room
  socket.on('join-room', ({ secretKey, alias }) => {
    try {
      const result = roomManager.joinRoom(secretKey, alias, socket.id);
      
      socket.join(secretKey);
      socket.secretKey = secretKey;
      socket.alias = alias;

      // Send room info to the user
      socket.emit('room-joined', {
        success: true,
        isAdmin: result.isAdmin,
        users: result.room.users,
        currentStreamer: result.room.currentStreamer
      });

      // Notify others in the room
      socket.to(secretKey).emit('user-joined', {
        user: result.user,
        users: result.room.users
      });

      console.log(`${alias} joined room ${secretKey} (Admin: ${result.isAdmin})`);
    } catch (error) {
      socket.emit('room-joined', {
        success: false,
        error: error.message
      });
    }
  });

  // WebRTC Signaling
  socket.on('offer', ({ offer, to }) => {
    socket.to(to).emit('offer', {
      offer,
      from: socket.id
    });
  });

  socket.on('answer', ({ answer, to }) => {
    socket.to(to).emit('answer', {
      answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Start streaming
  socket.on('start-streaming', () => {
    try {
      const room = roomManager.getRoom(socket.secretKey);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const user = room.users.find(u => u.socketId === socket.id);
      
      if (!user || (!user.isAdmin && !user.isCoAdmin)) {
        socket.emit('error', { message: 'Only admin can stream music' });
        return;
      }

      room.currentStreamer = {
        socketId: socket.id,
        alias: user.alias
      };

      // Notify all users in the room
      io.to(socket.secretKey).emit('streaming-started', {
        streamer: room.currentStreamer,
        streamerId: socket.id
      });

      console.log(`${user.alias} started streaming in room ${socket.secretKey}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Stop streaming
  socket.on('stop-streaming', () => {
    try {
      const room = roomManager.getRoom(socket.secretKey);
      
      if (room && room.currentStreamer && room.currentStreamer.socketId === socket.id) {
        room.currentStreamer = null;
        
        io.to(socket.secretKey).emit('streaming-stopped');
        console.log(`Streaming stopped in room ${socket.secretKey}`);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Transfer admin
  socket.on('transfer-admin', ({ targetSocketId }) => {
    try {
      const room = roomManager.getRoom(socket.secretKey);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const currentUser = room.users.find(u => u.socketId === socket.id);
      
      if (!currentUser || !currentUser.isAdmin) {
        socket.emit('error', { message: 'Only admin can transfer admin role' });
        return;
      }

      roomManager.transferAdmin(socket.secretKey, targetSocketId);

      // Notify all users
      io.to(socket.secretKey).emit('admin-transferred', {
        users: room.users
      });

      console.log(`Admin transferred in room ${socket.secretKey}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Request users list
  socket.on('get-users', () => {
    try {
      const room = roomManager.getRoom(socket.secretKey);
      if (room) {
        socket.emit('users-list', { users: room.users });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (socket.secretKey) {
      try {
        const result = roomManager.leaveRoom(socket.secretKey, socket.id);
        
        if (result.room) {
          // Notify others
          io.to(socket.secretKey).emit('user-left', {
            socketId: socket.id,
            users: result.room.users,
            newAdmin: result.newAdmin
          });

          // If streamer left, stop streaming
          if (result.wasStreaming) {
            io.to(socket.secretKey).emit('streaming-stopped');
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// For Vercel deployment, export the server
if (process.env.VERCEL) {
  module.exports = server;
} else {
  server.listen(PORT, HOST, () => {
    console.log(`🎵 Music Room Server running on ${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`WebSocket support: Enabled`);
  });
}
