# Vercel Deployment Guide

This guide explains how to deploy your Vite React application to Vercel with proper configuration for your multi-tenant architecture.

## 🚀 Quick Deployment

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will automatically detect your `vercel.json` configuration

### 3. Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## ⚙️ Configuration Explained

### `vercel.json` Features

#### 🏗️ **Build Configuration**
- **Framework**: Automatically detected as Vite
- **Build Command**: `npm run build` (includes TypeScript compilation)
- **Output Directory**: `dist` (Vite's default)
- **Install Command**: `npm install`

#### 🔄 **SPA Routing**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures all routes (`/admin`, `/student`, `/parent`, etc.) are handled by React Router, while preserving any `/api` routes for potential future use.

#### 🚀 **Performance Optimization**
- **Static Assets**: Long-term caching (1 year) for immutable assets
- **Asset Optimization**: Automatic compression and optimization
- **CDN**: Global edge distribution

#### 🔒 **Security Headers**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Permissions-Policy` - Restricts camera, microphone, geolocation

#### 🌐 **Multi-tenant Support**
- Subdomain handling for `*.manikumarkv.com`
- Proper routing for tenant-specific URLs

## 🔧 Environment Variables

### Required Environment Variables in Vercel

Set these in your Vercel dashboard (Project Settings → Environment Variables):

#### **Production Environment**
```env
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_AUTH0_DOMAIN=https://your-auth0-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_production_client_id
VITE_AUTH0_AUDIENCE=https://your-production-audience/
VITE_AUTH0_SCOPE=openid profile email
VITE_PLATFORM_DOMAIN=manikumarkv.com
```

#### **Preview/Staging Environment**
```env
VITE_API_BASE_URL=https://your-staging-api.com/api/v1
VITE_AUTH0_DOMAIN=https://your-auth0-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_staging_client_id
VITE_AUTH0_AUDIENCE=https://your-staging-audience/
VITE_AUTH0_SCOPE=openid profile email
VITE_PLATFORM_DOMAIN=staging.manikumarkv.com
```

### Setting Environment Variables

#### Via Vercel Dashboard
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate environment (Production, Preview, Development)

#### Via CLI
```bash
vercel env add VITE_API_BASE_URL production
vercel env add VITE_AUTH0_DOMAIN production
# ... add other variables
```

## 🌍 Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add `manikumarkv.com` and `*.manikumarkv.com`

2. **DNS Configuration**:
   ```dns
   # A record for root domain
   @ → 76.76.19.19

   # CNAME for wildcard subdomains
   * → cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Automatically provided by Vercel
   - Supports wildcard domains

## 🔍 Monitoring & Analytics

### Build Monitoring
```bash
# Check build logs
vercel logs your-deployment-url

# List deployments
vercel ls
```

### Performance Monitoring
- Vercel Analytics automatically enabled
- Core Web Vitals tracking
- Real user monitoring (RUM)

### Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance insights

## 🚨 Troubleshooting

### Common Issues

#### **1. Build Failures**
```bash
# Locally test the production build
npm run build
npm run preview
```

#### **2. Environment Variables Not Working**
- Ensure variables start with `VITE_`
- Check they're set for the correct environment
- Redeploy after adding new variables

#### **3. Routing Issues**
- Verify `vercel.json` routing configuration
- Check that all routes are client-side routes
- Ensure no server-side routing conflicts

#### **4. TypeScript Errors**
```bash
# Check for type errors before deployment
npm run type-check
npm run lint
```

### Deployment Health Checks

1. **Pre-deployment Checklist**:
   ```bash
   npm run lint          # Check for code issues
   npm run type-check    # Verify TypeScript
   npm run test          # Run tests
   npm run build         # Test production build
   ```

2. **Post-deployment Verification**:
   - Test all major routes
   - Verify Auth0 authentication flow
   - Check console for errors
   - Test on multiple devices/browsers

## 📊 Performance Optimization

### Recommended Vercel Settings

#### **Function Regions**
```json
{
  "functions": {
    "app/api/**": {
      "runtime": "nodejs18.x",
      "regions": ["iad1", "sfo1"]
    }
  }
}
```

#### **Edge Config** (for feature flags)
```bash
vercel env add EDGE_CONFIG production
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/stats.json
```

## 🔄 CI/CD Integration

### GitHub Actions (Optional)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Next Steps

1. **Deploy to Vercel**: Use the configuration provided
2. **Set Environment Variables**: Configure all required variables
3. **Test Deployment**: Verify all functionality works
4. **Configure Custom Domains**: Set up your domain(s)
5. **Enable Analytics**: Monitor performance and usage
6. **Set up Monitoring**: Add error tracking and alerts

Your Vite React application is now ready for production deployment on Vercel! 🎉