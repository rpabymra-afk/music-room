# 🎨 Render Deployment Guide - Music Room

## 📋 Quick Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name: `music-room`
   - Make it Public
   - Don't initialize with README
   - Click "Create repository"

2. **Push Your Code:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/music-room.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Click "Connect GitHub" (or use your connected account)
   - Select `music-room` repository
   - Configure as shown below
   - Click "Create Web Service"

### Method 2: Deploy Without GitHub (Direct Upload)

If you don't want to use GitHub:

1. **Go to Render Dashboard:** https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Select "Deploy an existing image from a registry"** OR **"Public Git repository"** and use:
   ```
   https://github.com/your-temporary-repo
   ```

---

## ⚙️ Render Configuration

When creating the Web Service, use these exact settings:

### Basic Settings:
| Field | Value |
|-------|-------|
| **Name** | `music-room` (or your preferred name) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt, Singapore) |
| **Branch** | `main` |
| **Root Directory** | _(leave empty)_ |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Environment Variables:
Click "Advanced" and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | _(Auto-generated, leave it)_ |

### Instance Type:
- **Free** (Select the FREE tier)
  - 512 MB RAM
  - Shared CPU
  - Spins down after 15 min inactivity
  - ✅ Perfect for testing and small user base

---

## 🎯 After Deployment

### 1. Get Your URL
Once deployed, Render gives you a URL like:
```
https://music-room-xxxx.onrender.com
```

### 2. Test Your App
- Open the URL in your browser
- Create a room with a secret key
- Open another tab/device
- Join the same room
- Test streaming!

### 3. Keep It Alive (Optional)

Since free tier spins down after 15 minutes of inactivity, you can:

**Option A: Use UptimeRobot**
1. Go to https://uptimerobot.com (free)
2. Create monitor
3. Add your Render URL
4. Set to ping every 14 minutes
5. Your app stays awake!

**Option B: Use Cron-Job.org**
1. Go to https://cron-job.org
2. Create free account
3. Add job to ping your URL every 14 minutes

---

## 🔧 Troubleshooting

### "Application failed to respond"
- Check Build Logs in Render dashboard
- Verify `npm start` works locally
- Check that PORT environment variable is used: `process.env.PORT`

### WebSocket Connection Failed
- Render supports WebSocket by default ✅
- No additional configuration needed
- If using custom domain, ensure SSL is enabled

### Build Failed
- Check Render logs for specific error
- Verify `package.json` has all dependencies
- Ensure Node version compatibility (we use Node 18+)

### Slow First Load
- This is normal! Free tier spins down after 15 min
- First request wakes it up (~30 seconds)
- After that, it's instant
- Use UptimeRobot to prevent spin-down

---

## 📊 Monitoring Your App

### View Logs:
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. See real-time server output

### Metrics:
- Click "Metrics" to see:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

### Manual Deploy:
If you make changes:
1. Push to GitHub
2. Render auto-deploys! ✅

Or click "Manual Deploy" → "Clear build cache & deploy"

---

## 🎨 Custom Domain (Optional)

1. **Buy domain** (Namecheap, GoDaddy, etc.)

2. **In Render:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Custom Domains"
   - Click "Add Custom Domain"
   - Enter: `music.yourdomain.com`

3. **Add DNS Records:**
   - Add CNAME record:
   ```
   music.yourdomain.com → your-app.onrender.com
   ```

4. **Wait for SSL:**
   - Render automatically generates SSL certificate
   - Takes 5-10 minutes

---

## 💰 Upgrading (When Needed)

### Free Tier Limits:
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ 750 hours/month (always free if single app)
- ⚠️ Spins down after 15 min inactivity

### Starter Plan ($7/month):
- ✅ Always on (no spin down!)
- ✅ 512 MB RAM
- ✅ Better performance
- ✅ Custom domains included

To upgrade:
1. Go to service settings
2. Change Plan Type to "Starter"
3. Add payment method
4. That's it!

---

## 🚀 Performance Tips

### 1. Enable Compression
Already included in your `server.js` with express settings!

### 2. Use Environment Variables
```javascript
// In your code
const MAX_USERS = process.env.MAX_USERS || 100;
```

### 3. Add Health Check
Render automatically pings `/` for health checks.
Your app already responds on root! ✅

### 4. Optimize WebSocket
Your Socket.IO is already optimized with:
- CORS configured
- Binary support
- Automatic reconnection

---

## 📈 Scaling Strategy

**Current (Free):**
- Good for: 10-50 concurrent users
- Cost: $0

**When You Grow:**
- **100 users**: Upgrade to Starter ($7/month)
- **500 users**: Consider Standard ($25/month)
- **1000+ users**: Professional ($85/month) or migrate to Railway/VPS

---

## ✅ Checklist

After deployment, verify:

- [ ] App loads at Render URL
- [ ] Can create a room
- [ ] Can join existing room
- [ ] Audio streaming works
- [ ] Audio visualizer displays
- [ ] Multiple users can connect
- [ ] WebSocket maintains connection
- [ ] Leave room works properly
- [ ] Room name displays in header
- [ ] Version number shows in footer

---

## 🆘 Need Help?

**Render Support:**
- Docs: https://render.com/docs
- Community: https://community.render.com
- Discord: https://discord.gg/render

**Your App Issues:**
- Check server logs in Render dashboard
- Verify environment variables are set
- Test locally first: `npm start`
- Check browser console for frontend errors

---

## 🎉 Success!

Once deployed, your Music Room will be:
- ✅ Live 24/7 (with UptimeRobot)
- ✅ HTTPS enabled automatically
- ✅ No WebSocket timeouts
- ✅ Free forever (750 hours/month)
- ✅ Auto-deploys from GitHub

**Share your URL and let people enjoy music together!** 🎵

---

*Deployed with ❤️ on Render • Last Updated: February 16, 2026*
