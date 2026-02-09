# 🧪 Testing Checklist - OnSpot Ecosystem

## Prerequisites
- [ ] Backend running on port 3000
- [ ] MongoDB connected and accessible
- [ ] All portals built successfully
- [ ] Test data seeded (if applicable)

---

## Phase 6.1: Admin Portal Testing

### Authentication
- [ ] **Login**: Navigate to `http://localhost:3001/login`
  - [ ] Enter valid credentials: `admin@onspot.one` / `Admin@123`
  - [ ] Should redirect to `/dashboard` on success
  - [ ] Invalid credentials show error message
  
- [ ] **Token Persistence**: 
  - [ ] Reload page - should remain logged in
  - [ ] Check `localStorage` has `adminToken`, `admin`, `adminData`

### Dashboard
- [ ] **Dashboard Page** (`/dashboard`):
  - [ ] Stats cards display numbers (partners, customers, pending approvals, services)
  - [ ] No console errors
  - [ ] Page loads within 2 seconds

### Partners Management
- [ ] **Partners Page** (`/dashboard/partners`):
  - [ ] Table displays partner list
  - [ ] Search/filter functionality works
  - [ ] Approval actions available for pending partners
  - [ ] Partner details modal/page opens

### Customers Management
- [ ] **Customers Page** (`/dashboard/customers`):
  - [ ] Customer list displays
  - [ ] Can view customer service history
  - [ ] Status badges show correctly

### Services
- [ ] **Services Page** (`/dashboard/services`):
  - [ ] All services listed
  - [ ] Filter by status works
  - [ ] Service details accessible

### Commissions
- [ ] **Commissions Page** (`/dashboard/commissions`):
  - [ ] Commission records display
  - [ ] Payment status shown correctly
  - [ ] Payout actions available

### Audit Logs
- [ ] **Audit Logs Page** (`/dashboard/audit-logs`):
  - [ ] Log entries displayed
  - [ ] Filtered by user/action
  - [ ] Timestamps formatted correctly

### Settings
- [ ] **Settings Page** (`/dashboard/settings`):
  - [ ] System settings visible
  - [ ] Can update configuration (if applicable)

### Logout
- [ ] **Logout**:
  - [ ] Click logout button
  - [ ] Redirects to `/login`
  - [ ] `localStorage` cleared
  - [ ] Cannot access protected pages without login

---

## Phase 6.2: Partner Portal Testing

### Registration Flow
- [ ] **Registration** (`http://localhost:3002/register`):
  - [ ] **Step 1**: Email verification
    - [ ] Enter email, send OTP
    - [ ] Receive OTP (check email or use mock: `123456`)
    - [ ] Verify OTP successfully
  - [ ] **Step 2**: Select partner tier (Silver/Gold/Platinum)
  - [ ] **Step 3**: Enter business details (name, PAN, GST, etc.)
  - [ ] **Step 4**: Enter address
  - [ ] **Step 5**: Bank details & password
  - [ ] **Step 6**: Review & accept terms
  - [ ] Submit - should redirect to success page with Partner ID

### Login
- [ ] **Login** (`/login`):
  - [ ] Enter registered email/password
  - [ ] Should redirect to `/dashboard`
  - [ ] Invalid credentials show error

### Password Creation
- [ ] **Set Password** (first-time login via admin invitation):
  - [ ] Secure link works
  - [ ] Password requirements enforced
  - [ ] Success redirects to dashboard

### Dashboard
- [ ] **Partner Dashboard** (`/dashboard`):
  - [ ] Shows stats: total sales, commissions, pending
  - [ ] Quick actions available
  - [ ] Recent sales displayed

### Sales Submission
- [ ] **Sales Page** (`/dashboard/sales`):
  - [ ] Form to register new sale
  - [ ] Customer details validation
  - [ ] Service plan selection
  - [ ] Submit creates sale record
  - [ ] Can view sales history

### Commissions
- [ ] **Commissions Page** (`/dashboard/commissions`):
  - [ ] Commission breakdown displayed
  - [ ] Earned vs. paid shown
  - [ ] Monthly/yearly filters work

### Customers
- [ ] **Customers Page** (`/dashboard/customers`):
  - [ ] List of customers registered by partner
  - [ ] Service status visible
  - [ ] Can view customer details

### Profile
- [ ] **Profile Page** (`/dashboard/profile`):
  - [ ] Partner details editable
  - [ ] Bank details updatable
  - [ ] Save changes works

### Logout
- [ ] **Logout**: Clears session, redirects to home

---

## Phase 6.3: Customer Portal Testing

### Registration
- [ ] **Registration** (`http://localhost:3003/register`):
  - [ ] Enter partner ID
  - [ ] Fill device & personal details
  - [ ] Select service plan (ESS/EPS/CDC)
  - [ ] OTP verification
  - [ ] Submit successfully

### Success Page
- [ ] **Registration Success**:
  - [ ] Shows confirmation
  - [ ] Service ID/reference number displayed
  - [ ] Option to login

### Login
- [ ] **Login** (`/login`):
  - [ ] Email & password authentication
  - [ ] Redirects to dashboard
  - [ ] Error handling for invalid credentials

### Dashboard
- [ ] **Customer Dashboard** (`/dashboard`):
  - [ ] Shows active services
  - [ ] Service plan details
  - [ ] Expiry dates visible

### Service Details
- [ ] **Service Details Page**:
  - [ ] Full service information
  - [ ] Coverage details
  - [ ] Claim status (if applicable)

### Service History
- [ ] **Service History**:
  - [ ] Past services listed
  - [ ] Status updates shown
  - [ ] Can download invoices/receipts (if applicable)

### Logout
- [ ] **Logout**: Session cleared

---

## Phase 6.4: Cross-Portal Testing

### Responsive Design
- [ ] **Mobile View** (375px width):
  - [ ] All portals render correctly
  - [ ] Navigation works
  - [ ] Forms are usable
  
- [ ] **Tablet View** (768px width):
  - [ ] Layout adapts properly

- [ ] **Desktop View** (1920px width):
  - [ ] Full features accessible

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Phase 6.5: API Testing

### Backend Health
- [ ] `GET /api/health` returns 200 OK

### Error Scenarios
- [ ] Invalid endpoints return 404
- [ ] Unauthorized access returns 401
- [ ] Rate limit triggers 429 error
- [ ] Malformed requests return 400

---

## ✅ Testing Sign-Off

**Date**: __________  
**Tested By**: __________  
**Status**: [ ] PASS / [ ] FAIL  
**Notes**:

