# Logo Setup Guide - OnSpot Portals

## Logo Requirements

| Portal | Logo Type | File Location | Status |
|--------|-----------|---------------|--------|
| **Admin** | Ccommerce Ecosystem (Company) | `repo/apps/admin/public/logo.png` | ⚠️ Too large (2.3MB) |
| **Partner** | Ccommerce Ecosystem (Company) | `repo/apps/partner/public/logo.png` | ⚠️ Too large (2.3MB) |
| **Customer** | OnSpot (Brand) | `repo/apps/customer/public/logo.png` | ❌ Wrong logo |

---

## Step-by-Step Instructions

### Step 1: Prepare Logo Files

You need **2 optimized logo files**:

1. **Company Logo** (Ccommerce Ecosystem)
   - For: Admin + Partner portals
   - Size: **< 500 KB**
   - Format: PNG with transparent background
   - Recommended dimensions: 800x200px or similar

2. **OnSpot Brand Logo**
   - For: Customer portal
   - Size: **< 500 KB**
   - Format: PNG with transparent background
   - Recommended dimensions: 800x200px or similar

### Step 2: Optimize Logo Files

**Option A: Online Tools** (Recommended)
- Use [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- Upload your logo
- Download optimized version

**Option B: ImageMagick Command**
```bash
# For company logo
convert company-logo.png -quality 85 -resize 800x -strip logo-company.png

# For OnSpot logo
convert onspot-logo.png -quality 85 -resize 800x -strip logo-onspot.png
```

**Option C: Photoshop/GIMP**
- Save As → PNG
- Reduce quality to 85%
- Ensure file size < 500KB

### Step 3: Replace Logo Files

Copy the optimized files:

```bash
# Navigate to repo root
cd c:\Users\Admin\Desktop\partnerappfinal-main\repo

# Copy company logo to admin and partner
copy path\to\logo-company.png apps\admin\public\logo.png
copy path\to\logo-company.png apps\partner\public\logo.png

# Copy OnSpot logo to customer
copy path\to\logo-onspot.png apps\customer\public\logo.png
```

### Step 4: Verify File Sizes

```bash
# Check file sizes (should all be < 500KB)
dir apps\admin\public\logo.png
dir apps\partner\public\logo.png
dir apps\customer\public\logo.png
```

### Step 5: Commit and Deploy

```bash
cd repo
git add apps/admin/public/logo.png apps/partner/public/logo.png apps/customer/public/logo.png
git commit -m "Updated logos: Company logo for admin/partner, OnSpot logo for customer (optimized)"
git push origin main
```

### Step 6: Redeploy on Dokploy

1. Go to Dokploy dashboard
2. Click "Redeploy" for each application (admin, partner, customer)
3. Wait for build to complete
4. Verify logos load on all portals

---

## Verification Checklist

After deployment, check these URLs:

- [ ] https://admin.onspot.one/login
  - Logo shows: **Ccommerce Ecosystem Company Logo**
  - Logo loads quickly (< 1 second)

- [ ] https://partners.onspot.one/
  - Logo shows: **Ccommerce Ecosystem Company Logo**
  - Logo loads quickly (< 1 second)

- [ ] https://customers.onspot.one/
  - Logo shows: **OnSpot Brand Logo**
  - Logo loads quickly (< 1 second)

---

## Current Code Setup

### Admin Portal (`apps/admin/app/login/page.js`)
```javascript
// Line 62 & 75
<img src="/logo.png" alt="Ccommerce Ecosystem" className="..." />
```
✅ Code is correct - uses `/logo.png` which will be company logo

### Partner Portal (`apps/partner/app/page.js`, etc.)
```javascript
<img src="/logo.png" alt="Ccommerce Ecosystem" className="..." />
```
✅ Code is correct - uses `/logo.png` which will be company logo

### Customer Portal (`apps/customer/app/login/page.js`, etc.)
```javascript
// Currently:
<img src="/logo.png" alt="Ccommerce Ecosystem" className="..." />

// Should remain the same but logo.png will be OnSpot logo
```
✅ Code is correct - just replace the file

---

## Summary

**Action Required**: 
1. Optimize **2 logo files** (company + OnSpot) to < 500KB each
2. Replace 3 files in the repo
3. Commit and push
4. Redeploy

**No code changes needed** - just replace the image files!

All logos will load from `/logo.png` but each app will have its own version in its `public` folder.
