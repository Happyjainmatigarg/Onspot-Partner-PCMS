// OnSpot Ecosystem Shared Constants

// Indian States and Union Territories (36 total)
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
  "Puducherry"
];

// Partner Types
export const PARTNER_TYPES = {
  PLATINUM: 'PLATINUM',
  GOLD: 'GOLD',
  SILVER: 'SILVER'
};

export const PARTNER_TYPE_CODES = {
  PLATINUM: 'P',
  GOLD: 'G',
  SILVER: 'S'
};

// Service Types
export const SERVICE_TYPES = {
  ESS: 'ESS', // Extended Service Support
  EPS: 'EPS', // Extended Protection Service
  CDC: 'CDC'  // Comprehensive Device Care
};

// Service Percentages
export const SERVICE_PERCENTAGES = {
  ESS: 8,
  EPS: 15,
  CDC: 20
};

// Commission Structure (serviceType -> partnerType -> percentage)
export const COMMISSION_STRUCTURE = {
  ESS: { PLATINUM: 30, GOLD: 25, SILVER: 20 },
  EPS: { PLATINUM: 28, GOLD: 23, SILVER: 18 },
  CDC: { PLATINUM: 32, GOLD: 27, SILVER: 22 }
};

// GST Rate
export const GST_PERCENTAGE = 18;

// Device Types
export const DEVICE_TYPES = [
  "Laptop", "Washing Machine", "Refrigerator", "AC", "TV", "Mobile", "Other"
];

// Status Constants
export const PARTNER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
};

export const CUSTOMER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE'
};

export const SERVICE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ACCOUNTS: 'ACCOUNTS',
  OPERATIONS: 'OPERATIONS'
};

// Validation Regex Patterns
export const REGEX_PATTERNS = {
  PARTNER_ID: /^ONSPOT-\d{2}-\d{2}-\d{4}-[PGS]-[A-Z0-9]{5}$/,
  CUSTOMER_ID: /^CUST-[6-9]\d{9}-[A-Z0-9]{4}$/,
  MOBILE: /^[6-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  GST_NUMBER: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN_NUMBER: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  PIN_CODE: /^\d{6}$/
};

// Company Info
export const COMPANY_INFO = {
  LEGAL_NAME: 'Ccommerce Ecosystem Pvt. Ltd.',
  BRAND_NAME: 'OnSpot™',
  GST: '06AABCC1234A1Z5',
  SUPPORT_EMAIL: 'support@onspot.one',
  ACCOUNTS_EMAIL: 'accounts@onspot.one',
  ADMIN_EMAIL: 'admin@onspot.one',
  PARTNER_EMAIL: 'partner@onspot.one'
};
