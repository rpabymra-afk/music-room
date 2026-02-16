// Configuration for API endpoint
const CONFIG = {
  // Automatically detect the API URL
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin
};
