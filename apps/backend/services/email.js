const nodemailer = require('nodemailer');

// Create transporter based on environment
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false  // Allow self-signed certs for development
  }
});

const COMPANY_INFO = {
  legalName: 'Ccommerce Ecosystem Pvt. Ltd.',
  brandName: 'OnSpot™',
  supportEmail: 'support@onspot.one',
  partnerEmail: 'partner@onspot.one',
  accountsEmail: 'accounts@onspot.one'
};

/**
 * Send partner welcome email
 */
async function sendPartnerWelcomeEmail(partner, pdfBuffer = null) {
  const mailOptions = {
    from: `"${COMPANY_INFO.brandName}" <${COMPANY_INFO.partnerEmail}>`,
    to: partner.email,
    cc: COMPANY_INFO.accountsEmail,
    subject: `Welcome to ${COMPANY_INFO.brandName} Partner Network | Partner ID: ${partner.partnerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">${COMPANY_INFO.brandName}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">${COMPANY_INFO.legalName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome to the Partner Network!</h2>
          
          <p>Dear <strong>${partner.applicantName}</strong>,</p>
          
          <p>Congratulations! Your partner registration has been successfully completed.</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Your Partner Details</h3>
            <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
            <p><strong>Partner Type:</strong> ${partner.partnerType}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Commission Structure (${partner.partnerType})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Service Type</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Rate</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Commission</th>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">ESS (Extended Service Support)</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">8%</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${partner.partnerType === 'PLATINUM' ? '30%' : partner.partnerType === 'GOLD' ? '25%' : '20%'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">EPS (Extended Protection Service)</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">15%</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${partner.partnerType === 'PLATINUM' ? '28%' : partner.partnerType === 'GOLD' ? '23%' : '18%'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">CDC (Comprehensive Device Care)</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">20%</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${partner.partnerType === 'PLATINUM' ? '32%' : partner.partnerType === 'GOLD' ? '27%' : '22%'}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">* 18% GST will be deducted from commission</p>
          </div>
          
          <div style="background: #667eea; color: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0;">Login to Your Dashboard</h3>
            <p>Access your partner dashboard using your Partner ID</p>
            <a href="${process.env.PARTNER_APP_URL || 'https://partner.onspot.one'}/login" 
               style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Login to Dashboard
            </a>
          </div>
          
          <p>Your partner agreement is attached to this email.</p>
          
          <p>Best regards,<br>
          The ${COMPANY_INFO.brandName} Team<br>
          ${COMPANY_INFO.legalName}</p>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Need help? Contact us at ${COMPANY_INFO.supportEmail}</p>
        </div>
      </div>
    `,
    attachments: pdfBuffer ? [{
      filename: `Partner_Agreement_${partner.partnerId}.pdf`,
      content: pdfBuffer
    }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${partner.email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send new customer pending approval notification to accounts
 */
async function sendCustomerPendingEmail(customer, product, service, partner) {
  const mailOptions = {
    from: `"${COMPANY_INFO.brandName}" <${COMPANY_INFO.partnerEmail}>`,
    to: COMPANY_INFO.accountsEmail,
    cc: 'admin@onspot.one',
    subject: `New Customer Registration — Pending Approval | ${customer.customerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏳ Pending Approval</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>New Customer Registration Received</h2>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Details</h3>
            <p><strong>Customer ID:</strong> ${customer.customerId}</p>
            <p><strong>Name:</strong> ${customer.customerName}</p>
            <p><strong>Mobile:</strong> ${customer.mobile}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Address:</strong> ${customer.address.street}, ${customer.address.city}, ${customer.address.state} - ${customer.address.pinCode}</p>
          </div>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Partner Details</h3>
            <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
            <p><strong>Name:</strong> ${partner.applicantName}</p>
            <p><strong>Type:</strong> ${partner.partnerType}</p>
          </div>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Device Details</h3>
            <p><strong>Type:</strong> ${product.productType}</p>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Model:</strong> ${product.model}</p>
            <p><strong>Serial:</strong> ${product.serialNumber}</p>
            <p><strong>Purchase Value:</strong> ₹${product.purchaseValue.toLocaleString('en-IN')}</p>
          </div>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Service Details</h3>
            <p><strong>Service ID:</strong> ${service.serviceId}</p>
            <p><strong>Type:</strong> ${service.serviceType}</p>
            <p><strong>Service Cost:</strong> ₹${service.serviceCost.toLocaleString('en-IN')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_APP_URL || 'https://onspotapp.onspot.one'}/customers/${customer.customerId}/approve" 
               style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              Review & Approve
            </a>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send pending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send customer approval email
 */
async function sendCustomerApprovalEmail(customer, service) {
  const mailOptions = {
    from: `"${COMPANY_INFO.brandName}" <${COMPANY_INFO.partnerEmail}>`,
    to: customer.email,
    subject: `Your ${COMPANY_INFO.brandName} Service is Now Active!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✓ Service Activated!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Welcome to ${COMPANY_INFO.brandName}!</h2>
          
          <p>Dear <strong>${customer.customerName}</strong>,</p>
          
          <p>Great news! Your device protection service has been approved and activated.</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #10b981;">Your Service Details</h3>
            <p><strong>Customer ID:</strong> ${customer.customerId}</p>
            <p><strong>Service Type:</strong> ${service.serviceType}</p>
            <p><strong>Service Start:</strong> ${new Date(service.serviceStartDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Service End:</strong> ${new Date(service.serviceEndDate).toLocaleDateString('en-IN')}</p>
          </div>
          
          <div style="background: #667eea; color: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0;">Access Your Portal</h3>
            <a href="${process.env.CUSTOMER_APP_URL || 'https://customer.onspot.one'}/login" 
               style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Login to Portal
            </a>
          </div>
          
          <p>Best regards,<br>
          The ${COMPANY_INFO.brandName} Team</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPartnerWelcomeEmail,
  sendCustomerPendingEmail,
  sendCustomerApprovalEmail,
  transporter
};
