// Room JavaScript with WebRTC Audio Streaming
const socket = io(CONFIG.API_URL);

// Get session data
const secretKey = sessionStorage.getItem('secretKey');
const alias = sessionStorage.getItem('alias');
let isAdmin = sessionStorage.getItem('isAdmin') === 'true';
let mySocketId = null;

// Redirect if no session
if (!secretKey || !alias) {
  window.location.href = 'index.html';
}

// WebRTC Configuration
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Store peer connections
const peerConnections = new Map();
let localStream = null;
let isStreaming = false;

// DOM Elements
const usersList = document.getElementById('usersList');
const leaveRoomBtn = document.getElementById('leaveRoom');
const startStreamBtn = document.getElementById('startStreamBtn');
const stopStreamBtn = document.getElementById('stopStreamBtn');
const adminControls = document.getElementById('adminControls');
const listenerView = document.getElementById('listenerView');
const nowPlaying = document.getElementById('nowPlaying');
const audioPlayer = document.getElementById('audioPlayer');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const streamingStatus = document.getElementById('streamingStatus');
const roomStatus = document.getElementById('roomStatus');
const instructions = document.getElementById('instructions');
const transferModal = document.getElementById('transferModal');
const transferUsersList = document.getElementById('transferUsersList');
const cancelTransfer = document.getElementById('cancelTransfer');
const visualizerContainer = document.getElementById('visualizerContainer');
const audioVisualizer = document.getElementById('audioVisualizer');
const roomNameDisplay = document.getElementById('roomName');

// Audio Visualizer Setup
let audioContext = null;
let analyser = null;
let dataArray = null;
let bufferLength = null;
let animationId = null;

// Display room name
roomNameDisplay.textContent = secretKey;

// Reconnect to room on page load
socket.emit('join-room', { secretKey, alias });

// Volume control
volumeSlider.addEventListener('input', (e) => {
  const volume = e.target.value / 100;
  audioPlayer.volume = volume;
  volumeValue.textContent = `${e.target.value}%`;
});

// Set initial volume
audioPlayer.volume = 0.8;

// Audio visualizer initialization
function initAudioVisualizer() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // Connect audio element to analyzer
    const source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
}

// Draw audio visualizer
function drawVisualizer() {
  if (!analyser || !visualizerContainer.style.display || visualizerContainer.style.display === 'none') {
    return;
  }

  animationId = requestAnimationFrame(drawVisualizer);

  const canvas = audioVisualizer;
  const canvasCtx = canvas.getContext('2d');
  
  // Set canvas size to match container
  const rect = visualizerContainer.getBoundingClientRect();
  canvas.width = rect.width - 32; // Account for padding
  canvas.height = rect.height - 32;

  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = 'rgba(15, 23, 42, 0.2)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

    // Create gradient for bars
    const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#a78bfa');

    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}

// Start visualizer
function startVisualizer() {
  try {
    initAudioVisualizer();
    visualizerContainer.style.display = 'block';
    drawVisualizer();
  } catch (error) {
    console.error('Error starting visualizer:', error);
  }
}

// Stop visualizer
function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  visualizerContainer.style.display = 'none';
}

// Handle window resize for responsive canvas
window.addEventListener('resize', () => {
  if (visualizerContainer.style.display !== 'none') {
    const rect = visualizerContainer.getBoundingClientRect();
    audioVisualizer.width = rect.width - 32;
    audioVisualizer.height = rect.height - 32;
  }
});

// Socket event handlers
socket.on('room-joined', (data) => {
  if (data.success) {
    mySocketId = socket.id;
    isAdmin = data.isAdmin;
    sessionStorage.setItem('isAdmin', isAdmin);
    
    updateUI();
    updateUsersList(data.users);

    if (data.currentStreamer) {
      handleStreamingStarted(data.currentStreamer);
    }
  }
});

socket.on('user-joined', (data) => {
  updateUsersList(data.users);
  showNotification(`${data.user.alias} joined the room`);
});

socket.on('user-left', (data) => {
  updateUsersList(data.users);
  
  // Close peer connection if exists
  if (peerConnections.has(data.socketId)) {
    peerConnections.get(data.socketId).close();
    peerConnections.delete(data.socketId);
  }

  // Update admin status if changed
  if (data.newAdmin && data.newAdmin.socketId === mySocketId) {
    isAdmin = true;
    sessionStorage.setItem('isAdmin', 'true');
    updateUI();
    showNotification('You are now the admin!');
  }
});

socket.on('streaming-started', async (data) => {
  console.log('Streaming started by:', data.streamer.alias);
  handleStreamingStarted(data.streamer, data.streamerId);
});

socket.on('streaming-stopped', () => {
  console.log('Streaming stopped');
  handleStreamingStopped();
});

socket.on('admin-transferred', (data) => {
  updateUsersList(data.users);
  
  const newAdmin = data.users.find(u => u.isAdmin);
  if (newAdmin && newAdmin.socketId === mySocketId) {
    isAdmin = true;
    sessionStorage.setItem('isAdmin', 'true');
    updateUI();
    showNotification('You are now the admin!');
  } else {
    isAdmin = false;
    sessionStorage.setItem('isAdmin', 'false');
    updateUI();
  }
});

// WebRTC Signaling
socket.on('offer', async ({ offer, from }) => {
  console.log('Received offer from:', from);
  
  const pc = createPeerConnection(from);
  
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  
  socket.emit('answer', { answer, to: from });
});

socket.on('answer', async ({ answer, from }) => {
  console.log('Received answer from:', from);
  
  const pc = peerConnections.get(from);
  if (pc) {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

socket.on('ice-candidate', async ({ candidate, from }) => {
  const pc = peerConnections.get(from);
  if (pc && candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

socket.on('users-list', (data) => {
  updateUsersList(data.users);
});

// Start streaming button
startStreamBtn.addEventListener('click', async () => {
  try {
    await startStreaming();
  } catch (error) {
    console.error('Error starting stream:', error);
    alert('Failed to start streaming. Please check microphone permissions.');
  }
});

// Stop streaming button
stopStreamBtn.addEventListener('click', () => {
  stopStreaming();
});

// Leave room button
leaveRoomBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to leave the room?')) {
    stopStreaming();
    socket.disconnect();
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
});

// Start streaming function
async function startStreaming() {
  try {
    // Request microphone access (which captures system audio on some devices)
    localStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      } 
    });

    isStreaming = true;
    
    // Setup visualizer for admin's own stream
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      
      const source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyser);
    }
    
    // Start visualizer
    visualizerContainer.style.display = 'block';
    drawVisualizer();
    
    // Notify server
    socket.emit('start-streaming');

    // Update UI
    startStreamBtn.style.display = 'none';
    stopStreamBtn.style.display = 'inline-block';
    streamingStatus.style.display = 'flex';
    instructions.style.display = 'none';

    // Get all users to send stream to
    socket.emit('get-users');

  } catch (error) {
    console.error('Failed to get media stream:', error);
    throw error;
  }
}

// Stop streaming function
function stopStreaming() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  // Stop visualizer
  stopVisualizer();

  // Close all peer connections
  peerConnections.forEach(pc => pc.close());
  peerConnections.clear();

  isStreaming = false;

  socket.emit('stop-streaming');

  // Update UI
  startStreamBtn.style.display = 'inline-block';
  stopStreamBtn.style.display = 'none';
  streamingStatus.style.display = 'none';
  instructions.style.display = 'block';
}

// Handle streaming started
async function handleStreamingStarted(streamer, streamerId) {
  nowPlaying.innerHTML = `
    <div class="player-icon">🎵</div>
    <p class="status-text">${streamer.alias} is streaming music</p>
  `;

  // Start visualizer
  startVisualizer();

  // If I'm not the streamer, set up to receive
  if (streamerId && streamerId !== mySocketId) {
    const pc = createPeerConnection(streamerId);
    
    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { offer, to: streamerId });
  }
}

// Handle streaming stopped
function handleStreamingStopped() {
  nowPlaying.innerHTML = `
    <div class="player-icon">🎵</div>
    <p class="status-text">No music playing</p>
  `;

  // Stop visualizer
  stopVisualizer();

  // Stop audio playback
  audioPlayer.pause();
  audioPlayer.srcObject = null;

  // Close all peer connections
  peerConnections.forEach(pc => pc.close());
  peerConnections.clear();
}

// Create peer connection
function createPeerConnection(remoteSocketId) {
  if (peerConnections.has(remoteSocketId)) {
    return peerConnections.get(remoteSocketId);
  }

  const pc = new RTCPeerConnection(rtcConfig);

  // Add local stream tracks if streaming
  if (localStream && isStreaming) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming stream
  pc.ontrack = (event) => {
    console.log('Received remote track');
    if (event.streams && event.streams[0]) {
      audioPlayer.srcObject = event.streams[0];
      audioPlayer.play().catch(e => console.error('Error playing audio:', e));
    }
  };

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        candidate: event.candidate,
        to: remoteSocketId
      });
    }
  };

  // Handle connection state
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState);
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      peerConnections.delete(remoteSocketId);
    }
  };

  peerConnections.set(remoteSocketId, pc);
  return pc;
}

// Update UI based on role
function updateUI() {
  if (isAdmin) {
    adminControls.style.display = 'block';
    listenerView.style.display = 'none';
  } else {
    adminControls.style.display = 'none';
    listenerView.style.display = 'block';
  }
}

// Update users list
function updateUsersList(users) {
  usersList.innerHTML = '';
  
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    
    let roleIcon = '👤';
    let roleText = 'Listener';
    
    if (user.isAdmin) {
      roleIcon = '👑';
      roleText = 'Admin';
      userCard.classList.add('admin');
    } else if (user.isCoAdmin) {
      roleIcon = '⭐';
      roleText = 'Co-Admin';
      userCard.classList.add('co-admin');
    }

    const isMe = user.socketId === mySocketId;
    
    userCard.innerHTML = `
      <div class="user-info">
        <span class="user-icon">${roleIcon}</span>
        <div class="user-details">
          <div class="user-name">${user.alias} ${isMe ? '(You)' : ''}</div>
          <div class="user-role">${roleText}</div>
        </div>
      </div>
      ${isAdmin && !isMe ? `
        <button class="btn btn-small transfer-admin-btn" data-socket-id="${user.socketId}">
          Make Admin
        </button>
      ` : ''}
    `;
    
    usersList.appendChild(userCard);
  });

  // Add transfer admin event listeners
  document.querySelectorAll('.transfer-admin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSocketId = e.target.dataset.socketId;
      if (confirm('Transfer admin role to this user?')) {
        socket.emit('transfer-admin', { targetSocketId });
      }
    });
  });
}

// Show notification
function showNotification(message) {
  roomStatus.textContent = message;
  setTimeout(() => {
    roomStatus.textContent = 'Connected';
  }, 3000);
}

// Initialize
updateUI();
