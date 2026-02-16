// Join Room JavaScript
const socket = io(CONFIG.API_URL);

const joinForm = document.getElementById('joinForm');
const secretKeyInput = document.getElementById('secretKey');
const aliasInput = document.getElementById('alias');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');

// Load saved alias if exists
const savedAlias = localStorage.getItem('musicroom_alias');
if (savedAlias) {
  aliasInput.value = savedAlias;
}

joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const secretKey = secretKeyInput.value.trim();
  const alias = aliasInput.value.trim();

  if (!secretKey || !alias) {
    showError('Please fill in all fields');
    return;
  }

  // Save alias to localStorage
  localStorage.setItem('musicroom_alias', alias);

  // Show loading
  loadingMessage.style.display = 'block';
  errorMessage.style.display = 'none';

  // Save credentials to sessionStorage
  sessionStorage.setItem('secretKey', secretKey);
  sessionStorage.setItem('alias', alias);

  // Join the room
  socket.emit('join-room', { secretKey, alias });
});

socket.on('room-joined', (data) => {
  loadingMessage.style.display = 'none';

  if (data.success) {
    // Store user info
    sessionStorage.setItem('isAdmin', data.isAdmin);
    sessionStorage.setItem('socketId', socket.id);
    
    // Redirect to room
    window.location.href = 'room.html';
  } else {
    showError(data.error || 'Failed to join room');
  }
});

socket.on('error', (data) => {
  loadingMessage.style.display = 'none';
  showError(data.message || 'An error occurred');
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Check connection status
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  showError('Connection lost. Please refresh the page.');
});
