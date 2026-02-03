const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
  accountsEmail: 'accounts@onspot.one',
  // Partner Portal Theme Colors
  primaryColor: '#0B2545',      // Dark Navy Blue
  secondaryColor: '#134074',    // Medium Navy
  accentColor: '#C9A227',       // Gold
  lightColor: '#8DA9C4',        // Light Blue Gray
  bgColor: '#F8FAFC'            // Light Background
};

// Company logo URL (hosted or base64)
const LOGO_URL = process.env.COMPANY_LOGO_URL || 'https://partner.onspot.one/logo.png';

/**
 * Generate Partner Portal themed email header
 */
function getEmailHeader(title) {
  return `
    <div style="background: linear-gradient(135deg, ${COMPANY_INFO.primaryColor} 0%, ${COMPANY_INFO.secondaryColor} 100%); padding: 30px; text-align: center;">
      <img src="${LOGO_URL}" alt="${COMPANY_INFO.brandName}" style="height: 60px; width: auto; margin-bottom: 15px; background: white; padding: 8px; border-radius: 8px;" />
      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      <p style="color: ${COMPANY_INFO.lightColor}; margin: 5px 0 0 0; font-size: 14px;">${COMPANY_INFO.legalName}</p>
    </div>
  `;
}

/**
 * Generate Partner Portal themed email footer
 */
function getEmailFooter() {
  return `
    <div style="background: ${COMPANY_INFO.primaryColor}; color: white; padding: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: ${COMPANY_INFO.lightColor}; font-size: 13px;">Need help? Contact us at</p>
      <a href="mailto:${COMPANY_INFO.supportEmail}" style="color: ${COMPANY_INFO.accentColor}; text-decoration: none; font-weight: bold;">${COMPANY_INFO.supportEmail}</a>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${COMPANY_INFO.secondaryColor};">
        <p style="margin: 0; font-size: 12px; color: ${COMPANY_INFO.lightColor};">© ${new Date().getFullYear()} ${COMPANY_INFO.legalName}. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Send partner welcome email with Partner Portal theme
 * Attaches PDF agreement (not DOCX as per user requirement)
 */
async function sendPartnerWelcomeEmail(partner, pdfBuffer = null) {
  const attachments = [];

  // Add PDF agreement if provided
  if (pdfBuffer) {
    attachments.push({
      filename: `Partner_Agreement_${partner.partnerId}.pdf`,
      content: pdfBuffer
    });
  }

  const mailOptions = {
    from: `"${COMPANY_INFO.brandName} Partner Portal" <${COMPANY_INFO.partnerEmail}>`,
    to: partner.email,
    cc: COMPANY_INFO.accountsEmail,
    subject: `🎉 Welcome to ${COMPANY_INFO.brandName} Partner Network | Partner ID: ${partner.partnerId}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${getEmailHeader('Welcome to Partner Network!')}
        
        <div style="padding: 35px; background: ${COMPANY_INFO.bgColor};">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${partner.applicantName}</strong>,</p>
          
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Congratulations! 🎊 Your partner registration has been successfully completed. Welcome to the ${COMPANY_INFO.brandName} Partner Network!
          </p>
          
          <!-- Partner Details Card -->
          <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid ${COMPANY_INFO.accentColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin: 0 0 15px 0; color: ${COMPANY_INFO.primaryColor}; font-size: 18px;">📋 Your Partner Details</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Partner ID:</td>
                <td style="padding: 8px 0; color: ${COMPANY_INFO.primaryColor}; font-weight: bold; font-family: monospace; font-size: 16px;">${partner.partnerId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Partner Type:</td>
                <td style="padding: 8px 0; color: ${COMPANY_INFO.accentColor}; font-weight: bold;">${partner.partnerType} Partner</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Registration Date:</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
            </table>
          </div>
          
          <!-- Commission Structure -->
          <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin: 0 0 15px 0; color: ${COMPANY_INFO.primaryColor}; font-size: 18px;">💰 ${partner.partnerType} Commission Rates</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: ${COMPANY_INFO.primaryColor}; color: white;">
                <th style="padding: 12px; text-align: left; border-radius: 6px 0 0 0;">Service</th>
                <th style="padding: 12px; text-align: center;">Rate</th>
                <th style="padding: 12px; text-align: center; border-radius: 0 6px 0 0;">Your Commission</th>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">ESS (Extended Service Support)</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e9ecef;">8%</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e9ecef; color: ${COMPANY_INFO.accentColor}; font-weight: bold;">${partner.partnerType === 'PLATINUM' ? '30%' : partner.partnerType === 'GOLD' ? '25%' : '20%'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">EPS (Extended Protection Service)</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e9ecef;">15%</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e9ecef; color: ${COMPANY_INFO.accentColor}; font-weight: bold;">${partner.partnerType === 'PLATINUM' ? '28%' : partner.partnerType === 'GOLD' ? '23%' : '18%'}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px;">CDC (Comprehensive Device Care)</td>
                <td style="padding: 12px; text-align: center;">20%</td>
                <td style="padding: 12px; text-align: center; color: ${COMPANY_INFO.accentColor}; font-weight: bold;">${partner.partnerType === 'PLATINUM' ? '32%' : partner.partnerType === 'GOLD' ? '27%' : '22%'}</td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #888; margin: 15px 0 0 0;">* 18% GST will be deducted from commission as per government regulations</p>
          </div>
          
          <!-- Login CTA -->
          <div style="background: linear-gradient(135deg, ${COMPANY_INFO.primaryColor} 0%, ${COMPANY_INFO.secondaryColor} 100%); color: white; border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-size: 20px;">🚀 Start Earning Today!</h3>
            <p style="margin: 0 0 20px 0; color: ${COMPANY_INFO.lightColor};">Access your partner dashboard and start adding customers</p>
            <a href="${process.env.PARTNER_APP_URL || 'https://partner.onspot.one'}/login" 
               style="display: inline-block; background: ${COMPANY_INFO.accentColor}; color: ${COMPANY_INFO.primaryColor}; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Login to Dashboard
            </a>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            📎 Your partner agreement is attached to this email. Please review and keep it for your records.
          </p>
          
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin-top: 25px;">
            Best regards,<br>
            <strong style="color: ${COMPANY_INFO.primaryColor};">The ${COMPANY_INFO.brandName} Team</strong><br>
            <span style="color: #888; font-size: 13px;">${COMPANY_INFO.legalName}</span>
          </p>
        </div>
        
        ${getEmailFooter()}
      </div>
    `,
    attachments
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
    subject: `⏳ New Customer Registration — Pending Approval | ${customer.customerId}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${getEmailHeader('⏳ Pending Approval')}
        
        <div style="padding: 30px; background: ${COMPANY_INFO.bgColor};">
          <h2 style="color: ${COMPANY_INFO.primaryColor}; margin: 0 0 20px 0;">New Customer Registration Received</h2>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid ${COMPANY_INFO.accentColor};">
            <h3 style="color: ${COMPANY_INFO.primaryColor}; margin-top: 0;">Customer Details</h3>
            <p><strong>Customer ID:</strong> ${customer.customerId}</p>
            <p><strong>Name:</strong> ${customer.customerName}</p>
            <p><strong>Mobile:</strong> ${customer.mobile}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Address:</strong> ${customer.address?.street || ''}, ${customer.address?.city || ''}, ${customer.address?.state || ''} - ${customer.address?.pinCode || ''}</p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${COMPANY_INFO.primaryColor}; margin-top: 0;">Partner Details</h3>
            <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
            <p><strong>Name:</strong> ${partner.applicantName}</p>
            <p><strong>Type:</strong> ${partner.partnerType}</p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${COMPANY_INFO.primaryColor}; margin-top: 0;">Device Details</h3>
            <p><strong>Type:</strong> ${product.productType}</p>
            <p><strong>Brand:</strong> ${product.brand}</p>
            <p><strong>Model:</strong> ${product.model}</p>
            <p><strong>Serial:</strong> ${product.serialNumber}</p>
            <p><strong>Purchase Value:</strong> ₹${product.purchaseValue?.toLocaleString('en-IN') || '0'}</p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${COMPANY_INFO.primaryColor}; margin-top: 0;">Service Details</h3>
            <p><strong>Service ID:</strong> ${service.serviceId}</p>
            <p><strong>Type:</strong> ${service.serviceType}</p>
            <p><strong>Service Cost:</strong> ₹${service.serviceCost?.toLocaleString('en-IN') || '0'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_APP_URL || 'https://onspotapp.onspot.one'}/customers/${customer.customerId}/approve" 
               style="display: inline-block; background: ${COMPANY_INFO.accentColor}; color: ${COMPANY_INFO.primaryColor}; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Review & Approve
            </a>
          </div>
        </div>
        
        ${getEmailFooter()}
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
    subject: `✅ Your ${COMPANY_INFO.brandName} Service is Now Active!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        ${getEmailHeader('✅ Service Activated!')}
        
        <div style="padding: 30px; background: ${COMPANY_INFO.bgColor};">
          <h2 style="color: ${COMPANY_INFO.primaryColor};">Welcome to ${COMPANY_INFO.brandName}!</h2>
          
          <p style="color: #555;">Dear <strong>${customer.customerName}</strong>,</p>
          
          <p style="color: #555;">Great news! 🎉 Your device protection service has been approved and activated.</p>
          
          <div style="background: white; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #10b981;">Your Service Details</h3>
            <p><strong>Customer ID:</strong> ${customer.customerId}</p>
            <p><strong>Service Type:</strong> ${service.serviceType}</p>
            <p><strong>Service Start:</strong> ${new Date(service.serviceStartDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Service End:</strong> ${new Date(service.serviceEndDate).toLocaleDateString('en-IN')}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, ${COMPANY_INFO.primaryColor} 0%, ${COMPANY_INFO.secondaryColor} 100%); color: white; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="margin-top: 0;">Access Your Portal</h3>
            <a href="${process.env.CUSTOMER_APP_URL || 'https://customer.onspot.one'}/login" 
               style="display: inline-block; background: ${COMPANY_INFO.accentColor}; color: ${COMPANY_INFO.primaryColor}; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Login to Portal
            </a>
          </div>
          
          <p style="color: #555;">Best regards,<br><strong>The ${COMPANY_INFO.brandName} Team</strong></p>
        </div>
        
        ${getEmailFooter()}
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
  transporter,
  COMPANY_INFO
};
