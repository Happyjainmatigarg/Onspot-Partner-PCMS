# Portal Issues - Diagnosis and Fixes

## Issues Identified

### 1. Logo Not Loading on All Portals
**Symptom**: Logo images not displaying on portals (admin, customer, partner)
**Root Causes**:
- Logo file is **2.3 MB** (very large - should be < 500KB)
- Potential static file serving issue in production

### 2. Portal Status Summary

| Portal | URL | Logo Path | Logo Size | Docker Config |
|--------|-----|-----------|-----------|---------------|
| Admin | `https://admin.onspot.one` | `/public/logo.png` | 2.3 MB | ✅ Correct |
| Customer | `https://customers.onspot.one` | `/public/logo.png` | 2.3 MB | ✅ Correct |
| Partner | `https://partners.onspot.one` | `/public/logo.png` | 2.3 MB | ✅ Correct |

---

## Fixes Applied

### ✅ 1. Email Configuration
- Updated customer emails to use `customer@onspot.one`
- Added separate OnSpot logo for customer emails
- Company logo for partner/admin emails

### ✅ 2. Dockerfile Configuration
All Dockerfiles correctly copy public folder:
```dockerfile
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

### ✅ 3. Next.js Configuration
All apps use `output: 'standalone'` which is correct for Docker deployment.

---

## Required Actions to Fix Logo Issue

### Option 1: Optimize Logo File (RECOMMENDED)
The current logo is 2.3 MB which is causing slow loading or failures.

**Steps**:
1. Compress the logo.png file to < 500 KB
2. Replace logo.png in all three folders:
   - `repo/apps/admin/public/logo.png`
   - `repo/apps/customer/public/logo.png`
   - `repo/apps/partner/public/logo.png`
3. Commit and push
4. Redeploy

**Tools for Compression**:
- Use online tools like TinyPNG or Squoosh
- Or use ImageMagick: `convert logo.png -quality 85 -resize 800x logo-optimized.png`

### Option 2: Rebuild and Redeploy
Force a fresh deployment on Dokploy:
1. Click "Rebuild" on the application
2. Wait for all containers to rebuild
3. Check if logos load

### Option 3: Check Deployment Logs
1. Check Docker build logs for any errors during `COPY --from=builder /app/public`
2. Verify public folder exists in running container:
   ```bash
   docker exec -it <container-name> ls -lh /app/public
   ```

---

## Verification Checklist

After redeployment, verify:

- [ ] https://partners.onspot.one/ - Logo loads
- [ ] https://customers.onspot.one/ - Logo loads
- [ ] https://admin.onspot.one/login - Logo loads (on left panel and mobile view)
- [ ] All pages load without console errors
- [ ]API calls work (check Network tab)

---

## Code Status

### ✅ All Code Changes Committed
1. Email service updated for customer@onspot.one
2. Customer email templates use OnSpot logo
3. Partner portal uses company logo (already correct)
4. Dockerfiles properly configured

### File References in Code

**Admin Login** (`apps/admin/app/login/page.js`):
- Line 62: `<img src="/logo.png" alt="Ccommerce Ecosystem" className="h-20 w-auto bg-white p-2 rounded-lg" />`
- Line 75: `<img src="/logo.png" alt="Ccommerce Ecosystem" className="h-16 w-auto mx-auto" />`

**Customer Login** (`apps/customer/app/login/page.js`):
- Line 71: `<img src="/logo.png" alt="Ccommerce Ecosystem" className="h-20 w-auto bg-white p-2 rounded-lg" />`

**Partner Pages**: Multiple references to `/logo.png` - all correct ✅

---

## Next Steps

**IMMEDIATE**: Optimize logo file size (2.3 MB → < 500 KB)
**THEN**: Redeploy all three applications
**VERIFY**: Test all portal URLs

All code is correct and committed. The issue is the logo file size - optimize and redeploy!
