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

// --- CONSTANTS: FULL TEXT CONTENT ---
const AGREEMENT_TEXT = `This Partner Agreement ("Agreement") is executed on this ${new Date().getDate()} day of ${new Date().toLocaleString('default', { month: 'long' })}, ${new Date().getFullYear()} ("Effective Date").

BY AND BETWEEN: Ccommerce Ecosystem Pvt. Ltd., a company incorporated under the provisions of the Companies Act, 2013, having its registered office at: SCO-27, Super Market, Old Court, NH-352A, Jind-126102, Haryana, India (hereinafter referred to as "Ccommerce" or the "Company", which expression shall, unless repugnant to the context or meaning thereof, be deemed to include its successors, permitted assigns, affiliates, and representatives);

AND

Partner Name: {{partnerName}}
Partner ID: {{partnerId}}
Registered Address: {{address}}
GST Number: {{gst}}
PAN Number: {{pan}}
Phone Number: {{mobile}}
Email ID: {{email}}
(hereinafter referred to as the "Partner", which expression shall include its proprietors, partners, directors, employees, agents, successors, and permitted assigns only as approved in writing by the Company).

RECITALS

WHEREAS the Company operates the "OnSpot™" brand providing post-sales service, repair, and extended warranty services after manufacturer warranty expiry.
WHEREAS the Partner wishes to promote and sell OnSpot™ service plans on a non-exclusive basis subject to the terms herein.

NOW, THEREFORE, the Parties agree as follows:

1. APPOINTMENT & SCOPE
1.1 The Company hereby grants the Partner a non-exclusive, non-transferable, revocable right to promote, market, and facilitate sales of OnSpot™ service plans strictly in accordance with this Agreement, applicable Service Level Agreements ("SLAs"), operational guidelines, policies, and pricing published on the Partner Registration Portal (https://partner.onspot.one) (the "Portal"), as may be amended by the Company at its sole discretion.
1.2 The Partner shall not have authority to bind the Company, collect payments, issue invoices, or make commitments on behalf of the Company. All customer contracts remain solely between the Company and end-customers.
1.3 Nothing herein creates a partnership, joint venture, agency, franchise, employment, or any fiduciary relationship. The Partner acts as an independent contractor at its own risk.
1.4 The Company may terminate the Partner's appointment immediately without notice or liability for any breach, suspected fraud, or at its sole discretion.

2. SERVICE PLANS & OBLIGATIONS
2.1 OnSpot™ service plans are post-sales service, repair, and extended warranty programs only (after manufacturer warranty expiry), explicitly not insurance, financial products, or risk transfer instruments.
2.2 Service plans include:
(a) Extended Service Support (ESS): Post-warranty repairs for functional/electrical failures (parts & labor), subject to SLAs.
(b) Enhanced Protection Service (EPS): Accidental/liquid damage repairs, subject to feasibility, exclusions, depreciation (up to 75%), deductibles (min. 500), and Beyond Economic Repair ("BER") thresholds.
(c) Comprehensive Device Care (CDC): ESS + EPS bundle, with additional limitations.
2.3 All claims governed by SLAs, eligibility, exclusions (e.g., unauthorized repairs, cosmetic damage), BER logic (Company's decision final), and notifications via Portal. Company not liable for service unavailability.
2.4 Partner shall not represent plans as insurance or guarantee outcomes. Partner indemnifies Company against all claims from misrepresentations.

3. FINANCIAL TERMS & COMMISSIONS
3.1 Commissions: As per schedule communicated via Portal/email, modifiable by Company anytime with 7 days' notice. No minimum guaranteed.
3.2 Calculation: On net realized revenue = Customer payment received by Company minus GST, TDS, refunds, chargebacks, cancellations (full/partial), discounts, fraud losses, BER non-reimbursements, and administrative fees (up to 20%).
3.3 Payment: Monthly, post-reconciliation (45 days after month-end), via NEFT/RTGS to verified bank account. Only on activated, non-cancelled plans (90-day retention period).
3.4 Company may withhold, deduct, or clawback commissions (even paid amounts) for: refunds, disputes, fraud, breaches, policy violations, chargebacks (up to 120 days post-sale), or reputational harm. No disputes permitted.
3.5 Partner responsible for all taxes (GST/TDS self-accounted). Company deducts TDS at source. No interest on delays/withholds.
3.6 No advance payments, minimums, or incentives unless specified in writing.

4. KYC, COMPLIANCE & CONDUCT
4.1 Partner must submit/maintain valid KYC (GST Cert, PAN, Aadhaar of signatory, address proof, cancelled cheque, incorporation docs, premises photo) prior to activation. Company may reject/revoke access anytime.
4.2 Partner represents and warrants: (i) full compliance with Indian laws including Consumer Protection Act, 2019, GST laws, and IT Act; (ii) no criminal record/blacklisting; (iii) accurate marketing materials approved by Company; (iv) no spam/false advertising.
4.3 Partner shall: Use only Company-approved collateral; record sales accurately; report suspicious activity; cooperate in audits (physical/digital, at Company cost).
4.4 Prohibited: Door-to-door sales, telemarketing without consent, upselling unrelated products, data sharing/sale.

5. CONFIDENTIALITY & DATA PROTECTION
5.1 "Confidential Information" includes all Company data, customer info, pricing, SLAs, Portal access. Partner shall not disclose/use except for Agreement purposes. Perpetual obligation.
5.2 Partner complies with DPDP Act 2023, IT Rules. Company owns all customer data; Partner has no rights. Breach triggers immediate termination + damages (min. 10 lakhs).

6. INDEMNIFICATION & LIABILITY
6.1 Partner indemnifies Company (and officers) against all losses, claims, liabilities from Partner's acts/omissions, misrepresentations, breaches, customer disputes, taxes, or third-party claims (including under Consumer Protection Act, 2019). Unlimited liability.
6.2 Company's liability capped at invoice value of disputed service plan (max. 5,000 per claim). No consequential, indirect, punitive damages. No liability for service failures beyond SLAs.
6.3 Force Majeure: Company not liable for delays due to acts of God, pandemics, supply issues, etc.

7. TERM, TERMINATION & CONSEQUENCES
7.1 Term: Effective Date until terminated. Either Party: 30 days' written notice.
7.2 Company termination rights (immediate, no notice): Breach, fraud, insolvency, policy violation, poor performance (e.g., >5% cancellation rate), reputational risk, regulatory action under Consumer Protection Act, 2019.
7.3 Post-termination: Partner ceases all activities; returns/destroys Confidential Info; pays outstanding dues; no commissions post-termination. Surviving clauses (1-6,8-10) continue indefinitely.

8. MISCELLANEOUS
8.1 Amendments: Only in writing signed by Company. Portal updates binding.
8.2 Severability: Invalid provisions severed without affecting others.
8.3 Waiver: No waiver unless written; single waiver not precedent.
8.4 Assignment: Partner may not assign. Company may freely.
8.5 Notices: Email (Company: legal@onspot.one; Partner: registered email).
8.6 Entire Agreement: Supersedes prior understandings.

9. GOVERNING LAW & DISPUTE RESOLUTION
9.1 Governed by Indian laws. Exclusive jurisdiction: Courts in Jind, Haryana.
Arbitration waived.

IN WITNESS WHEREOF, the Parties execute this Agreement.

For Ccommerce Ecosystem Pvt. Ltd.
Name: Authorized Signatory
Designation: Director
Date: ${new Date().toLocaleDateString('en-IN')}

For the Partner
Name: {{partnerName}}
Partner ID: {{partnerId}}
Date: ${new Date().toLocaleDateString('en-IN')}
`;

const SLA_TEXT = `1. Purpose of This Document
This document defines, in detail, the three OnSpot™ post-OEM service models, applicable service categories, coverage scope, exclusions, operational conditions, and pricing methodology.
This document must be read in conjunction with the approved OnSpot™ Service Level Agreements (SLAs).

2. Foundational Declarations (Non Negotiable)
Applicable uniformly across all plans, devices, and durations:
• OnSpot™ is not an insurance provider
• No theft, loss, or burglary protection
• No insurance policy or warranty certificate is issued
• This is a service-backed repair support program only
• Services commence strictly after OEM warranty expiry
• No cosmetic parts or cosmetic-only damages are covered

3. OnSpot™ Service Models (Three Core Plans)
Plan A: Extended Service Support – ESS
Post-OEM functional repair support is similar to manufacturer warranty conditions.

Plan B: Enhanced Protection Service – EPS
Higher-risk coverage with extended parts and repair exposure beyond standard ESS.

Plan C: Comprehensive Device Care – CDC
Maximum post-OEM protection with the widest repair scope and highest liability limits.

4. Service Duration & Renewal Structure
Package Option|Structure|Renewal
1 Year Plan|12 months post-OEM|Mandatory annual renewal
2 Year Plan|Sold as bundled commitment|Renewed yearly for continuity
3 Year Plan|Long-term engagement|Renewed yearly for validity
Important: Although 2Y and 3Y plans may be sold upfront, service validity is enforced year-wise and subject to annual renewal confirmation.

5. Product Categories Covered
Small Electronics
• Mobile Phones
• Laptops

Large Appliances
• Refrigerator
• Washing Machine
• Air Conditioner (AC)
• Dishwasher
• LCD / LED / Smart TV

6. Service Category Classification (Pricing Base)
Category|Risk Profile|Annual Charge (% of Invoice)
Category 1|Low Risk|8% per year
Category 2|Medium Risk|15% per year
Category 3|High Risk|20% per year
Percentage is calculated on original product invoice value (pre-discount).

7. Device Mapping by Category
Category 1 – 8%
• Mobile Phones
• Laptops

Category 2 – 15%
• LCD / LED / Smart TVs
• Washing Machines
• Dishwashers

Category 3 – 20%
• Refrigerators
• Air Conditioners (AC)

8. Coverage Scope by Service Plan
8.1 Plan A – Extended Service Support (ESS)
Covered:
• Electrical failures
• Mechanical breakdowns
• Functional defects
• OEM-equivalent parts & labour

Applicable To:
• All listed devices
• Post-OEM warranty period only

Not Covered:
• Wear & tear items
• Accidental or liquid damage
• Cosmetic parts (panels, knobs, trims)

8.2 Plan B – Enhanced Protection Service (EPS)
Includes all ESS coverage, plus:
• Extended component replacement limits
• Higher labour cost absorption
• Multiple claims within annual cap (Maximum two)

Excluded:
• Cosmetic-only damage
• Consumables
• User negligence

8.3 Plan C – Comprehensive Device Care (CDC)
Includes ESS + EPS, plus:
• Priority servicing
• Higher BER tolerance
• Wider component eligibility
Maximum liability capped at original invoice value, adjusted for depreciation and prior claims.

9. Pricing Illustration (Per Year)
Example 1: Mobile Phone (30,000 Invoice)
• Category 1 @ 8%
• Annual Charge: 2,400
• 3 Year Engagement (Renewed Annually): 7,200

Example 2: Washing Machine (40,000 Invoice)
• Category 2 @ 15%
• Annual Charge: 6,000
• 2 Year Engagement: 12,000

Example 3: Refrigerator (60,000 Invoice)
• Category 3 @ 20%
• Annual Charge: 12,000
• 1 Year Plan: 12,000

10. Large Appliance Service Fulfilment Conditions
• Primary attempt is on-site diagnosis and repair
• If repair is not feasible on-site, OnSpot™ or its partners are explicitly authorised to:
o Transport the appliance to the nearest authorised service center
o Return after repair completion
Customer consent is deemed accepted upon plan activation.

11. Exclusions (Detailed & Absolute)
• Cosmetic damage (scratches, dents, discoloration)
• External accessories & consumables
• Plastic trims, panels, knobs, filters
• Software, OS, data loss
• Intentional damage or misuse
• Unauthorized repairs or non-OEM parts
• Natural calamities & force majeure
• Rust, corrosion, scaling

12. Beyond Economic Repair (BER)
• BER applies when repair cost exceeds 75% of depreciated value
• Depreciation calculated from original purchase date
• Settlement limited to depreciated invoice value
• Device surrender mandatory in BER cases

13. Service Turnaround Commitments
• Complaint acknowledgement: Within 24 hours
• Target resolution: Up to 14 working days
• Subject to spare availability and logistics

14. Customer Registration & Activation Process
1. Product purchased (Online / Offline)
2. Visit OnSpot™ App or Website
3. Select device & service plan
4. Review terms & exclusions
5. Upload invoice & device details
6. Activation confirmation issued
7. Service starts post-OEM warranty expiry

15. Governance & Compliance
• Pan India authorised service network
• SLA-driven service delivery
• Transparent liability caps
• Compliant with Indian consumer protection laws

16. Depreciation Methodology (Applicable Across Plans)
Depreciation shall be calculated from the original Date of Purchase...
Elapsed Period|Mobile/Laptop|Other Products
0 – 3 Months|15%|20%
4 – 6 Months|20%|25%
7 – 9 Months|25%|30%
10 – 12 Months|30%|30%
13 – 18 Months|40%|35%
19 – 24 Months|50%|40%
25 – 36 Months|60%|55%
37 – 48 Months|N/A|70%

17. Final Disclaimer
OnSpot™ service plans are not insurance products and do not replace manufacturer warranties or insurance policies. Services are delivered strictly within the operational, financial, and contractual boundaries defined herein.
`;

/**
 * Helper to render formatted text
 * @param {PDFDocument} doc 
 * @param {string} text 
 */
function renderFormattedText(doc, text) {
    const lines = text.split('\n');
    let inTable = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) {
            doc.moveDown(0.5);
            return;
        }

        // Table Row (detected by |)
        if (line.includes('|')) {
            const cols = line.split('|');
            const colWidth = 450 / cols.length;
            const startX = 50;
            const startY = doc.y;

            // Draw background for header (naive check: first table row typically)
            if (!inTable) doc.font('Helvetica-Bold');
            else doc.font('Helvetica');

            cols.forEach((col, i) => {
                doc.text(col.trim(), startX + (i * colWidth), startY, {
                    width: colWidth - 5,
                    align: 'left'
                });
            });
            doc.moveDown();
            inTable = true;
            return;
        }
        inTable = false;

        // Headers (1. Title, 2. Title)
        if (/^\d+\./.test(line) || /^[A-Z\s&]+$/.test(line) && line.length < 50) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(11).text(line);
            doc.font('Helvetica').fontSize(10);
            return;
        }

        // Sub-headers (a), (b)
        if (/^\([a-z]\)/.test(line)) {
            doc.moveDown(0.2);
            doc.text(line, { indent: 20 });
            return;
        }

        // Bullets
        if (line.startsWith('•') || line.startsWith('o')) {
            doc.text(line, { indent: 20 });
            return;
        }

        // Normal Text
        doc.font('Helvetica').fontSize(10).text(line, { align: 'justify' });
    });
}

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
                bufferPages: true
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- HELPER FUNC ---
            const addWatermark = () => {
                if (fs.existsSync(LOGO_PATHS.onspot)) {
                    const pageWidth = doc.page.width;
                    const pageHeight = doc.page.height;
                    doc.save();
                    doc.opacity(0.1);
                    const imgWidth = 400;
                    doc.image(LOGO_PATHS.onspot, (pageWidth - imgWidth) / 2, (pageHeight - imgWidth) / 2, { width: imgWidth });
                    doc.restore();
                }
            };

            const addHeader = (title) => {
                if (fs.existsSync(LOGO_PATHS.company)) {
                    doc.image(LOGO_PATHS.company, 50, 45, { width: 80 });
                }
                doc.moveDown(0.5);
                doc.fontSize(16).font('Helvetica-Bold')
                    .text(COMPANY_INFO.legalName, { align: 'center', width: 400, transform: { translate: [60, 0] } });
                doc.fontSize(8).font('Helvetica')
                    .text(COMPANY_INFO.address, { align: 'center' });
                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(2);
                doc.fontSize(14).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown();
            };

            // --- PAGE 1: AGREEMENT ---
            addWatermark();
            addHeader('PARTNER AGREEMENT');

            // Replace variables
            let agreementContent = AGREEMENT_TEXT
                .replace(/{{partnerName}}/g, partner.applicantName)
                .replace(/{{partnerId}}/g, partner.partnerId)
                .replace(/{{address}}/g, `${partner.billingAddress?.street || ''}, ${partner.billingAddress?.city || ''}`)
                .replace(/{{gst}}/g, partner.gstNumber)
                .replace(/{{pan}}/g, partner.panNumber)
                .replace(/{{mobile}}/g, partner.mobile)
                .replace(/{{email}}/g, partner.email);

            renderFormattedText(doc, agreementContent);

            // --- PAGE 2+: SLA ---
            doc.addPage();
            addWatermark();

            // SLA Header
            if (fs.existsSync(LOGO_PATHS.onspot)) {
                doc.image(LOGO_PATHS.onspot, 250, 40, { width: 100 });
            }
            doc.moveDown(4);
            doc.fontSize(16).font('Helvetica-Bold').text('OnSpot™ Post-OEM Service Plans (SLAs)', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(`Issued by: ${COMPANY_INFO.legalName}`, { align: 'center' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(2);

            renderFormattedText(doc, SLA_TEXT);

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).text(
                    `Page ${i + 1} of ${range.count} | ${partner.partnerId}`,
                    50,
                    doc.page.height - 30,
                    { align: 'center', color: 'gray' }
                );
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generatePartnerAgreementPDF
};
