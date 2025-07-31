# Deployment Checklist for Vercel

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.error in production builds  
- [ ] All imports working correctly
- [ ] Figma assets converted to SVG components
- [ ] Error boundaries implemented

### ✅ Environment Configuration
- [ ] Environment variables configured in Vercel
- [ ] Supabase project ID and keys updated
- [ ] CORS settings configured in Supabase
- [ ] Edge functions deployed and accessible

### ✅ Build Configuration
- [ ] `vite.config.ts` optimized for production
- [ ] `vercel.json` configured with proper rewrites
- [ ] Bundle size optimized with code splitting
- [ ] PWA manifest and service worker configured

### ✅ Performance
- [ ] Images optimized and properly imported
- [ ] Code splitting implemented
- [ ] Lazy loading for non-critical components
- [ ] CSS optimized and purged

## Deployment Process

### Step 1: Environment Setup
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_PROJECT_ID=friuwcoerdzgzpccijsy
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NODE_ENV=production
   ```

### Step 2: Build Verification
```bash
# Test local build
npm run build
npm run preview

# Check for any build errors
npm run lint
```

### Step 3: Deploy
```bash
# Using Vercel CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

### Step 4: Post-Deployment Testing
- [ ] Login functionality works
- [ ] Task creation and updates sync properly
- [ ] PDF export functions correctly
- [ ] Mobile responsiveness maintained
- [ ] All routes accessible
- [ ] Error handling works for network issues

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Check all import paths are correct and case-sensitive

### Issue: Environment variables not working
**Solution**: 
- Ensure variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check variable values don't contain special characters

### Issue: Supabase connection fails
**Solution**:
- Verify Supabase project is active
- Check edge functions are deployed
- Confirm CORS settings allow your domain

### Issue: Build size too large
**Solution**:
- Check `vite.config.ts` for proper code splitting
- Remove unused dependencies
- Optimize images and assets

## Monitoring

### Post-Deployment Monitoring
1. **Vercel Analytics**: Monitor page views and performance
2. **Supabase Dashboard**: Check API usage and errors
3. **Browser Console**: Test for JavaScript errors
4. **Lighthouse**: Verify performance scores

### Health Checks
- [ ] Authentication flow complete
- [ ] Data persistence working
- [ ] PDF generation functional
- [ ] Mobile UX optimized
- [ ] Error boundaries catching issues

## Rollback Plan

If deployment issues occur:

1. **Immediate Rollback**:
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Debug Locally**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Check Logs**:
   - Vercel Function logs
   - Supabase Edge Function logs
   - Browser console errors

## Success Criteria

Deployment is successful when:
- [ ] Application loads without errors
- [ ] Authentication works end-to-end
- [ ] Data syncs between devices
- [ ] PDF export generates correctly
- [ ] Mobile experience is smooth
- [ ] Performance scores > 90 on Lighthouse
- [ ] No critical console errors

## Maintenance

### Regular Tasks
1. **Weekly**: Check Vercel analytics and error rates
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review performance metrics and optimize

### Backup Strategy
- Supabase automatically handles database backups
- Code is version controlled in Git
- Environment variables documented in team settings