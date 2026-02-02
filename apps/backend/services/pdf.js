const PDFDocument = require('pdfkit');

const COMPANY_INFO = {
    legalName: 'Ccommerce Ecosystem Pvt. Ltd.',
    brandName: 'OnSpot™',
    gst: '06AABCC1234A1Z5',
    address: 'Mumbai, Maharashtra, India'
};

/**
 * Generate Partner Agreement PDF
 * @param {Object} partner - Partner document
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePartnerAgreementPDF(partner) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(18).font('Helvetica-Bold')
                .text(COMPANY_INFO.legalName, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).font('Helvetica')
                .text('PARTNER REGISTRATION AGREEMENT', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(10)
                .text(`GST: ${COMPANY_INFO.gst}`, { align: 'center' });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            // Agreement date
            doc.fontSize(10)
                .text(`Agreement Date: ${new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })}`, { align: 'right' });
            doc.moveDown();

            // Partner Details Section
            doc.fontSize(12).font('Helvetica-Bold').text('PARTNER DETAILS');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');

            const details = [
                ['Partner ID', partner.partnerId],
                ['Partner Type', partner.partnerType],
                ['Applicant Name', partner.applicantName],
                ['Email', partner.email],
                ['Mobile', partner.mobile],
                ['GST Number', partner.gstNumber],
                ['PAN Number', partner.panNumber]
            ];

            details.forEach(([label, value]) => {
                doc.text(`${label}: ${value}`);
            });

            doc.moveDown();
            doc.text(`Billing Address: ${partner.billingAddress.street}, ${partner.billingAddress.city}, ${partner.billingAddress.state} - ${partner.billingAddress.pinCode}`);

            doc.moveDown(2);

            // Terms and Conditions
            doc.fontSize(12).font('Helvetica-Bold').text('TERMS AND CONDITIONS');
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica');

            const terms = [
                {
                    title: '1. SCOPE OF AGREEMENT',
                    content: 'This agreement governs the relationship between the Partner and Ccommerce Ecosystem Pvt. Ltd. for the sale and distribution of OnSpot™ device protection services.'
                },
                {
                    title: '2. SERVICES',
                    content: 'The Partner is authorized to sell three service types: ESS (Extended Service Support - 8%), EPS (Extended Protection Service - 15%), and CDC (Comprehensive Device Care - 20%).'
                },
                {
                    title: '3. COMMISSION STRUCTURE',
                    content: `As a ${partner.partnerType} partner, you are entitled to the following commission rates: ESS - ${partner.partnerType === 'PLATINUM' ? '30%' : partner.partnerType === 'GOLD' ? '25%' : '20%'}, EPS - ${partner.partnerType === 'PLATINUM' ? '28%' : partner.partnerType === 'GOLD' ? '23%' : '18%'}, CDC - ${partner.partnerType === 'PLATINUM' ? '32%' : partner.partnerType === 'GOLD' ? '27%' : '22%'}. 18% GST will be deducted from all commissions.`
                },
                {
                    title: '4. GST COMPLIANCE',
                    content: 'The Partner must maintain valid GST registration and comply with all applicable tax laws. All invoices must include proper GST details.'
                },
                {
                    title: '5. PAYMENT TERMS',
                    content: 'Commissions will be processed within 15 working days of service activation. Payment will be made via bank transfer to the registered account.'
                },
                {
                    title: '6. PROHIBITED ACTIVITIES',
                    content: 'The Partner shall not misrepresent services, provide false information, or engage in any fraudulent activities. Violation may result in immediate termination.'
                },
                {
                    title: '7. DATA PRIVACY',
                    content: 'Customer data collected must be handled in accordance with applicable data protection laws. The Partner shall not share customer information with third parties.'
                },
                {
                    title: '8. BRANDING',
                    content: 'The Partner may use OnSpot™ branding materials as provided. Any modifications to branding require prior written approval.'
                },
                {
                    title: '9. TERMINATION',
                    content: 'Either party may terminate this agreement with 30 days written notice. Pending commissions will be settled within 45 days of termination.'
                },
                {
                    title: '10. DISPUTE RESOLUTION',
                    content: 'Any disputes arising from this agreement shall be resolved through arbitration in Mumbai, Maharashtra, under Indian Arbitration Act.'
                }
            ];

            terms.forEach(term => {
                doc.font('Helvetica-Bold').text(term.title);
                doc.font('Helvetica').text(term.content);
                doc.moveDown(0.8);
            });

            // Signature section
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            doc.fontSize(10);
            doc.text('ACCEPTANCE', { align: 'center' });
            doc.moveDown();
            doc.text('By registering as a partner, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined in this agreement.', { align: 'center' });

            doc.moveDown(2);
            doc.text(`Partner: ${partner.applicantName}`, 50);
            doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 350);

            doc.moveDown(3);

            // Footer
            doc.fontSize(8).fillColor('#666')
                .text('This is a computer-generated document. No signature required.', { align: 'center' });
            doc.text(`Document ID: AGR-${partner.partnerId}`, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generatePartnerAgreementPDF
};
