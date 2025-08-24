# 🚀 Deploy to Render

This guide will help you deploy your Lead Management System to Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Supabase Project** - Ensure your Supabase project is set up and accessible

## 🔧 Environment Variables

Before deploying, you'll need to set these environment variables in Render:

### Required Environment Variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Files Created for Deployment

- `render.yaml` - Render service configuration
- `.render-buildpacks` - Buildpack specification
- `public/_redirects` - Client-side routing support

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Select the repository containing your Lead Management System

### 3. Configure the Service

**Build Command:**
```
npm run build
```

**Publish Directory:**
```
dist
```

**Environment Variables:**
- Add your Supabase URL and API key as environment variables

### 4. Deploy

1. Click **"Create Static Site"**
2. Render will automatically build and deploy your app
3. Wait for the build to complete (usually 2-5 minutes)

## 🌐 Custom Domain (Optional)

1. In your Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain and follow the DNS configuration instructions

## 🔄 Automatic Deployments

- **Auto-deploy**: Enabled by default
- **Branch**: `main` (or your default branch)
- **Preview deployments**: Available for pull requests

## 📱 Testing Your Deployment

1. Visit your Render URL (e.g., `https://your-app.onrender.com`)
2. Test the login/registration flow
3. Verify lead management functionality
4. Check that all routes work correctly

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check the build logs in Render
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Routing Issues**
   - Ensure `_redirects` file is in the `public` directory
   - Check that `render.yaml` has proper routing configuration

3. **Environment Variables**
   - Verify Supabase credentials are correct
   - Check that variables start with `VITE_`

### Build Logs:
- View build logs in Render dashboard
- Check for missing dependencies or build errors

## 🔒 Security Notes

- Never commit sensitive environment variables
- Use Render's environment variable system
- Ensure Supabase RLS policies are properly configured

## 📊 Monitoring

- **Uptime**: Monitor your service status
- **Logs**: View application logs in Render dashboard
- **Performance**: Check response times and error rates

## 🎉 Success!

Once deployed, your Lead Management System will be accessible at your Render URL. Users can register, login, and manage leads from anywhere in the world!

---

**Need Help?** Check Render's [documentation](https://render.com/docs) or their [community forum](https://community.render.com/).
