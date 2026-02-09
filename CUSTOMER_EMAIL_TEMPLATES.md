# Customer Email Templates - OnSpot

## Email Configuration

**Sender Email**: customer@onspot.one  
**Credentials**: Same as partner@onspot.one (same app password)  
**Logo Used**: OnSpot Logo (not Ccommerce Ecosystem logo)

---

## 1. Customer Approval Email

### Email Details:
- **From**: "OnSpot™" <customer@onspot.one>
- **To**: Customer's email
- **Subject**: ✅ Your OnSpot™ Service is Now Active!

### Email Content:

```
┌──────────────────────────────────────────────────────────────┐
│                  [OnSpot Logo]                                 │
│              ✅ Service Activated!                             │
│         Ccommerce Ecosystem Pvt. Ltd.                          │
└──────────────────────────────────────────────────────────────┘

Welcome to OnSpot™!

Dear [Customer Name],

Great news! 🎉 Your device protection service has been approved and activated.

┌─────────────────────────────────────────────────────────────┐
│ Your Service Details                                          │
├─────────────────────────────────────────────────────────────┤
│ Customer ID: CUST-XXXXXXXXXX-XXXX                             │
│ Service Type: EPS / ESS / CDC                                 │
│ Service Start: DD/MM/YYYY                                     │
│ Service End: DD/MM/YYYY                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Access Your Portal                                 │
│                                                               │
│         [Login to Portal] (Button)                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Best regards,
The OnSpot™ Team

┌──────────────────────────────────────────────────────────────┐
│ Need help? Contact us at:                                     │
│ support@onspot.one                                            │
│                                                               │
│ © 2026 Ccommerce Ecosystem Pvt. Ltd. All rights reserved.    │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Customer Pending Email (to Admin)

### Email Details:
- **From**: "OnSpot™ Partner Portal" <partner@onspot.one>
- **To**: Admin/Accounts email
- **CC**: accounts@onspot.one
- **Subject**: ⏳ New Customer Registration Pending Approval

### Email Content:

```
┌──────────────────────────────────────────────────────────────┐
│           [Ccommerce Ecosystem Logo]                          │
│            ⏳ Pending Approval                                │
│         Ccommerce Ecosystem Pvt. Ltd.                          │
└──────────────────────────────────────────────────────────────┘

New Customer Registration Received

┌─────────────────────────────────────────────────────────────┐
│ Customer Details                                              │
├─────────────────────────────────────────────────────────────┤
│ Customer ID: CUST-XXXXXXXXXX-XXXX                             │
│ Name: John Doe                                                │
│ Mobile: +91 XXXXXXXXXX                                        │
│ Email: customer@example.com                                   │
│ Address: Full address with city, state, PIN                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Partner Details                                               │
├─────────────────────────────────────────────────────────────┤
│ Partner ID: ONSPOT-DD-MM-YYYY-X-XXXXX                         │
│ Name: Partner Name                                            │
│ Type: RETAILER / DISTRIBUTOR / DEALER                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Device Details                                                │
├─────────────────────────────────────────────────────────────┤
│ Type: SMARTPHONE / LAPTOP / TABLET                            │
│ Brand: Apple / Samsung / etc.                                 │
│ Model: iPhone 15 Pro / Galaxy S24                             │
│ Serial: XXXXXXXXXXXXXXXXX                                     │
│ Purchase Value: ₹50,000                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Service Details                                               │
├─────────────────────────────────────────────────────────────┤
│ Service ID: SRV-CUST-XXXXXX-XXXXXX                            │
│ Type: EPS / ESS / CDC                                         │
│ Service Cost: ₹7,500                                          │
└─────────────────────────────────────────────────────────────┘

         [Review & Approve] (Button)

┌──────────────────────────────────────────────────────────────┐
│ Need help? Contact us at:                                     │
│ support@onspot.one                                            │
│                                                               │
│ © 2026 Ccommerce Ecosystem Pvt. Ltd. All rights reserved.    │
└──────────────────────────────────────────────────────────────┘
```

---

## Email Configuration in .env

Add to your `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=customer@onspot.one
EMAIL_PASS=[same app password as partner@onspot.one]

# For customer emails, use:
CUSTOMER_EMAIL_USER=customer@onspot.one
CUSTOMER_EMAIL_PASS=[same app password]

# URLs
CUSTOMER_APP_URL=https://customers.onspot.one
ADMIN_APP_URL=https://onspotapp.onspot.one
COMPANY_LOGO_URL=https://partner.onspot.one/logo.png
ONSPOT_LOGO_URL=https://customers.onspot.one/logo.png
```

---

## Logo Usage Summary

| Portal/Email | Logo Type | Logo URL |
|--------------|-----------|----------|
| Partner Portal | Ccommerce Ecosystem Logo | `/logo.png` (company) |
| Customer Portal | OnSpot Logo | `/logo.png` (OnSpot brand) |
| Customer Emails | OnSpot Logo | `https://customers.onspot.one/logo.png` |
| Partner Emails | Ccommerce Logo | `https://partner.onspot.one/logo.png` |
| Admin Portal | Ccommerce Logo | `/logo.png` (company) |

---

**Note**: The email service now uses:
- `customer@onspot.one` for all customer-facing emails
- `partner@onspot.one` for partner-related emails
- OnSpot logo appears only in customer portal and customer emails
- Company logo appears in partner portal, admin portal, and partner emails
