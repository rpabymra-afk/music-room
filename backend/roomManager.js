const crypto = require('crypto');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Generate a secure hash for the secret key
  hashSecretKey(secretKey) {
    return crypto.createHash('sha256').update(secretKey).digest('hex');
  }

  // Join or create a room
  joinRoom(secretKey, alias, socketId) {
    if (!secretKey || !alias) {
      throw new Error('Secret key and alias are required');
    }

    const roomId = this.hashSecretKey(secretKey);
    
    let room = this.rooms.get(roomId);
    let isAdmin = false;

    if (!room) {
      // Create new room
      room = {
        id: roomId,
        secretKey: secretKey,
        users: [],
        currentStreamer: null,
        createdAt: new Date()
      };
      isAdmin = true;
    }

    // Check if alias is already taken
    const aliasTaken = room.users.some(u => u.alias === alias);
    if (aliasTaken) {
      throw new Error('Alias already taken in this room');
    }

    // Add user
    const user = {
      socketId,
      alias,
      isAdmin: isAdmin,
      isCoAdmin: false,
      joinedAt: new Date()
    };

    room.users.push(user);
    this.rooms.set(roomId, room);

    return { room, user, isAdmin };
  }

  // Leave room
  leaveRoom(secretKey, socketId) {
    const roomId = this.hashSecretKey(secretKey);
    const room = this.rooms.get(roomId);

    if (!room) {
      return { room: null };
    }

    const userIndex = room.users.findIndex(u => u.socketId === socketId);
    if (userIndex === -1) {
      return { room: null };
    }

    const leavingUser = room.users[userIndex];
    const wasAdmin = leavingUser.isAdmin;
    const wasStreaming = room.currentStreamer && room.currentStreamer.socketId === socketId;

    room.users.splice(userIndex, 1);

    if (wasStreaming) {
      room.currentStreamer = null;
    }

    let newAdmin = null;

    // If admin left and there are still users
    if (wasAdmin && room.users.length > 0) {
      // Promote first co-admin or first user to admin
      const coAdmin = room.users.find(u => u.isCoAdmin);
      const newAdminUser = coAdmin || room.users[0];
      newAdminUser.isAdmin = true;
      newAdminUser.isCoAdmin = false;
      newAdmin = newAdminUser;
    }

    // Delete room if empty
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
      return { room: null, wasStreaming };
    }

    return { room, newAdmin, wasStreaming };
  }

  // Get room by secret key
  getRoom(secretKey) {
    if (!secretKey) return null;
    const roomId = this.hashSecretKey(secretKey);
    return this.rooms.get(roomId);
  }

  // Transfer admin role
  transferAdmin(secretKey, targetSocketId) {
    const roomId = this.hashSecretKey(secretKey);
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    const targetUser = room.users.find(u => u.socketId === targetSocketId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Remove admin from current admins
    room.users.forEach(u => {
      if (u.isAdmin) {
        u.isAdmin = false;
        u.isCoAdmin = true; // Previous admin becomes co-admin
      }
    });

    // Set new admin
    targetUser.isAdmin = true;
    targetUser.isCoAdmin = false;
  }
}

module.exports = RoomManager;
