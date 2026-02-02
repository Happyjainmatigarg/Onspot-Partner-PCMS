# OnSpot™ Device Protection Ecosystem

A comprehensive three-application platform for device protection services by **Ccommerce Ecosystem Pvt. Ltd.**

## Architecture

```
repo/
├── apps/
│   ├── backend/       # Node.js/Express API (Port 3000)
│   ├── partner/       # Partner Portal - Next.js (Port 3001)
│   ├── customer/      # Customer App - Next.js (Port 3002)
│   └── admin/         # Admin Dashboard - Next.js (Port 3003)
└── packages/
    └── shared/        # Shared constants and utilities
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Navigate to the repo directory
cd repo

# Install all dependencies
npm run install:all

# Or install individually:
cd apps/backend && npm install
cd apps/partner && npm install
cd apps/customer && npm install
cd apps/admin && npm install
```

### Development

```bash
# Run all apps concurrently (from repo root)
npm run dev

# Or run individually:
npm run dev:backend   # Backend API at http://localhost:3000
npm run dev:partner   # Partner App at http://localhost:3001
npm run dev:customer  # Customer App at http://localhost:3002
npm run dev:admin     # Admin Dashboard at http://localhost:3003
```

### Default Admin Credentials
```
Email: admin@onspot.one
Password: Admin@123
```

## Applications

### 1. Partner Portal (Port 3001)
- Partner registration with OTP verification
- Partner login with password setup flow
- Dashboard: sales, commissions, customers
- View-only commission tracking

### 2. Customer App (Port 3002)
- Device registration with Partner ID verification
- Service cost calculator (ESS 8%, EPS 15%, CDC 20%)
- Customer portal after approval

### 3. Admin Dashboard (Port 3003)
- Dashboard with stats and pending approvals
- Partner and customer management
- Approval workflow with commission calculation
- Audit logs and system settings

## API Endpoints

### Public Endpoints
- `POST /api/otp/send` - Send OTP via voice call
- `POST /api/otp/verify` - Verify OTP code
- `POST /api/partners/register` - Partner registration
- `POST /api/partners/login` - Partner login
- `POST /api/customers/verify-partner` - Verify Partner ID
- `POST /api/customers/register` - Customer registration

### Protected Endpoints (JWT Required)
- `GET /api/partners/dashboard` - Partner dashboard data
- `GET /api/partners/sales` - Partner sales list
- `GET /api/admin/dashboard/summary` - Admin dashboard summary
- `POST /api/admin/customers/:id/approve` - Approve customer
- `POST /api/admin/customers/:id/reject` - Reject customer

## Commission Structure

| Partner Type | ESS (8%) | EPS (15%) | CDC (20%) |
|--------------|----------|-----------|-----------|
| Platinum     | 30%      | 28%       | 32%       |
| Gold         | 25%      | 23%       | 27%       |
| Silver       | 20%      | 18%       | 22%       |

*Note: 18% GST is deducted from all commissions.*

## ID Formats

- **Partner ID**: `ONSPOT-DD-MM-YYYY-{P|G|S}-XXXXX`
- **Customer ID**: `CUST-[mobile]-XXXX`
- **Service ID**: `SRV-XXXXXXXX`
- **Product ID**: `PRD-XXXXXXXX`
- **Admin ID**: `ADM-XXXXXXXX`

## Environment Variables

Copy `.env.example` to `.env` in `apps/backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/onspot_ecosystem
JWT_SECRET=your-secret-key
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## License

Proprietary - Ccommerce Ecosystem Pvt. Ltd.
