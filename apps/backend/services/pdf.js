const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const COMPANY_INFO = {
    legalName: 'Ccommerce Ecosystem Pvt. Ltd.',
    brandName: 'OnSpot™',
    gst: '06AABCC1234A1Z5',
    address: 'SCO-27, Super Market, Old Court, NH-352A, Jind-126102, Haryana, India'
};

const LOGO_PATHS = {
    company: path.join(__dirname, '../public/assets/company-logo.png'),
    onspot: path.join(__dirname, '../public/assets/onspot-logo.png')
};

/**
 * Generate Partner Agreement PDF with SLA
 * @param {Object} partner - Partner document
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePartnerAgreementPDF(partner) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                bufferPages: true // Enable buffer pages for page count
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- HELPER FUNCTIONS ---

            const addWatermark = () => {
                const logoPath = LOGO_PATHS.onspot; // Use OnSpot logo for watermark
                if (fs.existsSync(logoPath)) {
                    const pageWidth = doc.page.width;
                    const pageHeight = doc.page.height;
                    doc.save();
                    doc.opacity(0.1); // Low opacity for watermark
                    // Center the watermark
                    const imgWidth = 400;
                    doc.image(logoPath, (pageWidth - imgWidth) / 2, (pageHeight - imgWidth) / 2, { width: imgWidth });
                    doc.restore();
                }
            };

            const addHeader = (title) => {
                // Add Logo if exists
                if (fs.existsSync(LOGO_PATHS.company)) {
                    doc.image(LOGO_PATHS.company, 50, 45, { width: 80 });
                }

                doc.moveDown(0.5);
                doc.fontSize(16).font('Helvetica-Bold')
                    .text(COMPANY_INFO.legalName, { align: 'center', width: 400, transform: { translate: [60, 0] } }); // Offset for logo

                doc.fontSize(8).font('Helvetica')
                    .text(COMPANY_INFO.address, { align: 'center' });

                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(2);

                doc.fontSize(14).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown();
            };

            // --- PARTNER AGREEMENT SECTION ---

            addWatermark();
            addHeader('PARTNER AGREEMENT');

            // Date
            doc.fontSize(10).font('Helvetica')
                .text(`Effective Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
            doc.moveDown();

            // Preamble
            doc.fontSize(9).font('Helvetica').text(
                `This Partner Agreement ("Agreement") is executed on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} ("Effective Date").\n\n` +
                `BY AND BETWEEN: Ccommerce Ecosystem Pvt. Ltd., a company incorporated under the provisions of the Companies Act, 2013, having its registered office at: ${COMPANY_INFO.address} (hereinafter referred to as "Ccommerce" or the "Company").\n\n` +
                `AND\n\n` +
                `Partner Name: ${partner.applicantName}\n` +
                `Partner ID: ${partner.partnerId}\n` +
                `Registered Address: ${partner.billingAddress?.street}, ${partner.billingAddress?.city}\n` +
                `GST Number: ${partner.gstNumber}\n` +
                `PAN Number: ${partner.panNumber}\n` +
                `Phone Number: ${partner.mobile}\n` +
                `Email ID: ${partner.email}\n` +
                `(hereinafter referred to as the "Partner").`
            );
            doc.moveDown();

            // Recitals
            doc.font('Helvetica-Bold').text('RECITALS');
            doc.font('Helvetica').text(
                `WHEREAS the Company operates the "${COMPANY_INFO.brandName}" brand providing post-sales service, repair, and extended warranty services after manufacturer warranty expiry.\n` +
                `WHEREAS the Partner wishes to promote and sell ${COMPANY_INFO.brandName} service plans on a non-exclusive basis subject to the terms herein.`
            );
            doc.moveDown();

            // Terms
            const terms = [
                {
                    title: '1. APPOINTMENT & SCOPE',
                    text: '1.1 The Company hereby grants the Partner a non-exclusive, non-transferable, revocable right to promote, market, and facilitate sales of OnSpot™ service plans strictly in accordance with this Agreement, applicable Service Level Agreements ("SLAs"), operational guidelines, policies, and pricing published on the Partner Registration Portal.\n' +
                        '1.2 The Partner shall not have authority to bind the Company, collect payments, issue invoices, or make commitments on behalf of the Company.\n' +
                        '1.3 Nothing herein creates a partnership, joint venture, agency, franchise, employment, or any fiduciary relationship. The Partner acts as an independent contractor.\n' +
                        '1.4 The Company may terminate the Partner\'s appointment immediately without notice or liability for any breach, suspected fraud, or at its sole discretion.'
                },
                {
                    title: '2. SERVICE PLANS & OBLIGATIONS',
                    text: '2.1 OnSpot™ service plans are post-sales service, repair, and extended warranty programs only (after manufacturer warranty expiry), explicitly not insurance, financial products, or risk transfer instruments.\n' +
                        '2.2 Service plans include: ESS (Extended Service Support), EPS (Enhanced Protection Service), and CDC (Comprehensive Device Care).\n' +
                        '2.3 All claims governed by SLAs, eligibility, exclusions, and BER logic. Company not liable for service unavailability.\n' +
                        '2.4 Partner shall not represent plans as insurance or guarantee outcomes.'
                },
                {
                    title: '3. FINANCIAL TERMS & COMMISSIONS',
                    text: `3.1 Commissions: As per schedule (${partner.partnerType} rates apply). Modifiable by Company anytime with 7 days notice.\n` +
                        '3.2 Calculation: On net realized revenue (Customer payment minus GST, TDS, refunds, etc).\n' +
                        '3.3 Payment: Monthly, post-reconciliation (45 days after month-end), via NEFT/RTGS.\n' +
                        '3.4 Company may withhold/deduct commissions for refunds, disputes, or fraud.\n' +
                        '3.5 Partner responsible for all taxes (GST/TDS self-accounted).'
                },
                {
                    title: '4. KYC, COMPLIANCE & CONDUCT',
                    text: '4.1 Partner must submit/maintain valid KYC. Company may reject/revoke access anytime.\n' +
                        '4.2 Partner represents and warrants full compliance with Indian laws including Consumer Protection Act, 2019.\n' +
                        '4.3 Partner shall use only approved collateral and report suspicious activity.\n' +
                        '4.4 Prohibited: Door-to-door sales, telemarketing without consent, upselling unrelated products.'
                },
                {
                    title: '5. CONFIDENTIALITY & DATA PROTECTION',
                    text: '5.1 Confidential Information includes all Company data. Perpetual obligation.\n' +
                        '5.2 Partner complies with DPDP Act 2023. Company owns all customer data.'
                },
                {
                    title: '6. INDEMNIFICATION',
                    text: '6.1 Partner indemnifies Company against all losses from Partner\'s acts/omissions.\n' +
                        '6.2 Company\'s liability capped at invoice value of disputed service plan (max. ₹5,000).'
                },
                {
                    title: '7. TERM & TERMINATION',
                    text: '7.1 Term: Effective Date until terminated. Either Party: 30 days written notice.\n' +
                        '7.2 Company termination rights (immediate): Breach, fraud, insolvency, policy violation.\n' +
                        '7.3 Post-termination: Partner ceases all activities; returns Confidential Info.'
                },
                {
                    title: '8. GOVERNING LAW',
                    text: '8.1 Governed by Indian laws. Exclusive jurisdiction: Courts in Jind, Haryana. Arbitration waived.'
                }
            ];

            terms.forEach(term => {
                doc.font('Helvetica-Bold').fontSize(10).text(term.title);
                doc.font('Helvetica').fontSize(9).text(term.text);
                doc.moveDown(0.5);
            });

            // Signatures
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica-Bold').text('IN WITNESS WHEREOF, the Parties execute this Agreement.');
            doc.moveDown();

            const yPos = doc.y;

            // Company Sig
            doc.text(`For ${COMPANY_INFO.legalName}`, 50, yPos);
            doc.text('Name: Authorized Signatory', 50, yPos + 15);
            doc.text('Designation: Director', 50, yPos + 30);
            doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), 50, yPos + 45);

            // Partner Sig
            doc.text('For the Partner', 300, yPos);
            doc.text(`Name: ${partner.applicantName}`, 300, yPos + 15);
            doc.text(`Partner ID: ${partner.partnerId}`, 300, yPos + 30);
            doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), 300, yPos + 45);

            // --- SLA SECTION (New Page) ---
            doc.addPage();
            addWatermark();

            // Header for SLA with OnSpot Logo
            if (fs.existsSync(LOGO_PATHS.onspot)) {
                doc.image(LOGO_PATHS.onspot, 250, 40, { width: 100 });
            }
            doc.moveDown(4);

            doc.fontSize(16).font('Helvetica-Bold').text('OnSpot™ Post-OEM Service Plans (SLAs)', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(`Issued by: ${COMPANY_INFO.legalName}`, { align: 'center' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(2);

            const slaSections = [
                {
                    title: '1. Purpose',
                    text: 'This document defines the three OnSpot™ post-OEM service models, applicable service categories, coverage scope, exclusions, and operational conditions. Must be read in conjunction with the Agreement.'
                },
                {
                    title: '2. Foundational Declarations',
                    text: '• OnSpot™ is not an insurance provider.\n' +
                        '• No theft, loss, or burglary protection.\n' +
                        '• No insurance policy or warranty certificate is issued.\n' +
                        '• Services commence strictly after OEM warranty expiry.'
                },
                {
                    title: '3. OnSpot™ Service Models',
                    text: 'Plan A (ESS): Extended Service Support - Functional repair support.\n' +
                        'Plan B (EPS): Enhanced Protection Service - Higher-risk coverage with extended parts.\n' +
                        'Plan C (CDC): Comprehensive Device Care - Maximum protection with widest repair scope.'
                },
                {
                    title: '4. Service Duration',
                    text: 'All plans valid for 12 months post-OEM warranty. Renewal required annually.'
                },
                {
                    title: '5. Covered Categories',
                    text: 'Small Electronics: Mobile Phones, Laptops.\n' +
                        'Large Appliances: Refrigerator, Washing Machine, AC, Dishwasher, TV.'
                },
                {
                    title: '6. Exclusions',
                    text: '• Cosmetic damage (scratches, dents).\n' +
                        '• External accessories & consumables.\n' +
                        '• Software, OS, data loss.\n' +
                        '• Intentional damage or misuse.\n' +
                        '• Unauthorized repairs.'
                },
                {
                    title: '7. Service Turnaround',
                    text: '• Complaint acknowledgement: Within 24 hours.\n' +
                        '• Target resolution: Up to 14 working days.\n' +
                        '• Subject to spare availability.'
                },
                {
                    title: '8. Depreciation',
                    text: 'Depreciation calculated from original purchase date. 0-3 months: 15-20%, 4-6 months: 20-25%, increasing with age. Claims exceeding 75% of depreciated value are classified as Beyond Economic Repair (BER).'
                }
            ];

            slaSections.forEach(sec => {
                doc.font('Helvetica-Bold').fontSize(11).text(sec.title);
                doc.font('Helvetica').fontSize(10).text(sec.text);
                doc.moveDown(0.8);
            });

            doc.fontSize(8).text('Disclaimer: OnSpot™ service plans are not insurance products.', { align: 'center', valign: 'bottom' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generatePartnerAgreementPDF
};
