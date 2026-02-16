# 🚂 Quick Deploy to Railway

## One-Command Deploy

```bash
npx @railway/cli@latest login && npx @railway/cli@latest init && npx @railway/cli@latest up
```

## Step-by-Step

### 1. Install Railway CLI (Windows PowerShell)
```powershell
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```
This will open your browser to authenticate.

### 3. Initialize Project
```bash
railway init
```
- Select: "Create new project"
- Name: "music-room" (or your preferred name)

### 4. Deploy
```bash
railway up
```

### 5. Generate Public URL
```bash
railway domain
```
This creates a public URL like: `music-room-production.up.railway.app`

### 6. View Logs (Optional)
```bash
railway logs
```

### 7. Add Environment Variables (Optional)
```bash
railway variables set NODE_ENV=production
railway variables set MAX_USERS=100
```

## That's It!

Your app will be live at: `https://your-app-name.up.railway.app`

## Features You Get

✅ No WebSocket timeouts
✅ No cold starts  
✅ Always-on server
✅ Automatic HTTPS
✅ GitHub auto-deploy (if you connect repo)
✅ $5 free credit every month

## Monitor Your App

View dashboard: https://railway.app/dashboard

## Auto-Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. In Railway dashboard: New Project → Deploy from GitHub repo
3. Select your repository
4. Railway auto-deploys on every push!

## Cost

- First $5/month: **FREE**
- After $5: ~$0.000463 per GB-hour
- Typical usage: $3-5/month for moderate traffic
- Only pay for what you use

## Troubleshooting

**Port Issues?**
- Railway automatically assigns PORT environment variable
- Our code uses: `process.env.PORT || 3000` ✅

**WebSocket Not Working?**
- Railway supports WebSocket by default ✅
- No extra configuration needed

**Want Custom Domain?**
```bash
railway domain add yourdomain.com
```

---

**You're all set!** Your music streaming app now runs without limitations. 🎵
