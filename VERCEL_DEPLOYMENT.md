# 🚀 Deploy Music Room to Vercel

## Prerequisites

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Create a Vercel Account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Navigate to project directory**:
   ```bash
   cd c:\Project\MusicPlayStore
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   During setup, answer the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - What's your project's name? **music-room** (or your preferred name)
   - In which directory is your code located? **./** (press Enter)
   - Want to override settings? **No** (press Enter)

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Initialize Git Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Music Room app"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com/new)
   - Create a new repository named "music-room"
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/music-room.git
   git branch -M main
   git push -u origin main
   ```

4. **Import to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Project Name**: Music Room
     - **Framework Preset**: Other
     - **Root Directory**: ./
     - **Build Command**: (leave default)
     - **Output Directory**: (leave default)
   - Click "Deploy"

## ⚠️ Important Notes About Vercel Deployment

### WebSocket Limitations

Vercel's serverless architecture has some limitations with WebSocket connections:

1. **Connection Timeouts**: WebSocket connections may timeout after 5 minutes on Vercel's Hobby plan
2. **Cold Starts**: First request may be slower due to serverless cold starts
3. **Concurrent Connections**: Limited by Vercel's serverless function limits

### Recommended Alternative Hosting for Production

For a production app with persistent WebSocket connections, consider:

1. **Railway.app** (Recommended for WebSockets):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Render.com** (Great for Node.js apps):
   - Connect your GitHub repository
   - Select "Web Service"
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Heroku** (Classic option):
   - Create Procfile: `web: node backend/server.js`
   - Deploy via Heroku CLI or GitHub integration

4. **DigitalOcean App Platform**:
   - One-click deployment from GitHub
   - Better WebSocket support

### If You Still Want to Use Vercel

Vercel works, but you may experience:
- Connection drops after 5 minutes
- Need to reconnect periodically
- Better for testing than production

To improve Vercel experience:
1. Implement auto-reconnect in frontend
2. Use Vercel Pro plan for better limits
3. Consider using a separate WebSocket service (like Pusher or Ably)

## Post-Deployment Configuration

After deployment, your app will be available at:
```
https://music-room-XXXXXXX.vercel.app
```

### Update CORS Settings (if needed)

If you encounter CORS issues, update [backend/server.js](backend/server.js):

```javascript
const io = socketIO(server, {
  cors: {
    origin: "https://your-app-name.vercel.app",
    methods: ["GET", "POST"]
  }
});
```

## Testing Your Deployment

1. Open the Vercel URL in your browser
2. Create a room with a secret key
3. Open the same URL in another browser/device
4. Join the same room with a different alias
5. Test audio streaming

## Environment Variables (Optional)

If you need to set environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add variables like:
   - `NODE_ENV=production`

## Troubleshooting

### WebSocket Connection Fails
- Check browser console for errors
- Ensure CORS is configured correctly
- Try using Vercel Pro for better WebSocket support

### Audio Streaming Issues
- Check browser permissions for microphone
- Ensure HTTPS is enabled (required for WebRTC)
- Test with different browsers

### Cold Starts
- First request may take 5-10 seconds
- Subsequent requests will be faster
- Consider upgrading to Vercel Pro to reduce cold starts

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for DNS propagation (can take up to 48 hours)

## Monitoring

Monitor your deployment:
- **Vercel Dashboard**: View logs, analytics, and deployment status
- **Real-time Logs**: `vercel logs` command
- **Analytics**: Available in Vercel Dashboard

## Support

For issues:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- GitHub Issues: Create an issue in your repository

---

**Note**: For the best experience with this real-time audio streaming app, we recommend deploying to **Railway**, **Render**, or **Heroku** instead of Vercel, as they better support persistent WebSocket connections.
