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

// Read Agreement and SLA from markdown files
const AGREEMENT_MD_PATH = path.join(__dirname, '../../../../Partner Aggrement.md');
const SLA_MD_PATH = path.join(__dirname, '../../../../SLA.md');

/**
 * Helper to render formatted text with improved markdown handling
 * @param {PDFDocument} doc 
 * @param {string} text 
 */
function renderFormattedText(doc, text) {
    const lines = text.split('\n');
    let inTable = false;
    let isFirstTableRow = true;

    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) {
            doc.moveDown(0.5);
            return;
        }

        // Table Row (detected by |)
        if (line.includes('|')) {
            const cols = line.split('|').filter(col => col.trim());
            const colWidth = 480 / cols.length;
            const startX = 60;
            const startY = doc.y;

            // Check if we need a new page
            if (startY > 700) {
                doc.addPage();
                addWatermark(doc);
            }

            // Draw background for header row
            if (!inTable) {
                doc.rect(startX - 5, startY - 2, 480, 20).fill('#0B2545');
                doc.fill('white');
                doc.font('Helvetica-Bold').fontSize(9);
                isFirstTableRow = true;
            } else {
                doc.font('Helvetica').fontSize(9).fill('black');
                if (isFirstTableRow) {
                    doc.rect(startX - 5, startY - 2, 480, 18).stroke('#CCCCCC');
                    isFirstTableRow = false;
                }
            }

            cols.forEach((col, i) => {
                const cellX = startX + (i * colWidth);
                const cellText = col.trim();
                doc.text(cellText, cellX, startY, {
                    width: colWidth - 10,
                    align: 'left'
                });

                // Draw cell borders
                if (inTable) {
                    doc.rect(cellX - 5, startY - 2, colWidth, 18).stroke('#EEEEEE');
                }
            });

            doc.moveDown(0.8);
            inTable = true;
            return;
        }
        inTable = false;
        isFirstTableRow = false;

        // Check if we need a new page
        if (doc.y > 720) {
            doc.addPage();
            addWatermark(doc);
        }

        // Section Headers (numbered like "1. TITLE" or "2. TITLE")
        if (/^\d+\.\s+[A-Z\s&]+$/.test(line)) {
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#0B2545').text(line);
            doc.moveDown(0.3);
            doc.font('Helvetica').fontSize(10).fillColor('black');
            return;
        }

        // Sub-section headers (like "1.1", "2.3")
        if (/^\d+\.\d+/.test(line)) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(10).text(line);
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(0.2);
            return;
        }

        // Sub-items (a), (b), (c)
        if (/^\([a-z]\)/.test(line)) {
            doc.moveDown(0.2);
            doc.text(line, { indent: 20 });
            return;
        }

        // Bullets (• or o)
        if (line.startsWith('•') || line.startsWith('o')) {
            doc.text(line, { indent: 15 });
            doc.moveDown(0.1);
            return;
        }

        // Bold headers (all caps, short lines)
        if (/^[A-Z\s&]+$/.test(line) && line.length < 60 && !line.includes('WHEREAS')) {
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(11).text(line);
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(0.3);
            return;
        }

        // Normal Text
        doc.font('Helvetica').fontSize(10).fillColor('black').text(line, { align: 'justify' });
        doc.moveDown(0.1);
    });
}

/**
 * Add watermark to current page
 */
function addWatermark(doc) {
    if (fs.existsSync(LOGO_PATHS.onspot)) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        doc.save();
        doc.opacity(0.05);
        const imgWidth = 400;
        try {
            doc.image(LOGO_PATHS.onspot, (pageWidth - imgWidth) / 2, (pageHeight - imgWidth) / 2, { width: imgWidth });
        } catch (error) {
            console.warn('Watermark image failed:', error.message);
        }
        doc.restore();
    }
}

/**
 * Add header with company logo and info
 */
function addHeader(doc, title) {
    if (fs.existsSync(LOGO_PATHS.company)) {
        try {
            doc.image(LOGO_PATHS.company, 50, 45, { width: 80 });
        } catch (error) {
            console.warn('Company logo failed:', error.message);
        }
    }
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold')
        .text(COMPANY_INFO.legalName, { align: 'center', continued: false });
    doc.fontSize(8).font('Helvetica')
        .text(COMPANY_INFO.address, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(1.5);
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

            // --- PAGE 1: AGREEMENT ---
            addWatermark(doc);
            addHeader(doc, 'PARTNER AGREEMENT');

            // Read Agreement from markdown file
            let agreementContent = '';
            try {
                agreementContent = fs.readFileSync(AGREEMENT_MD_PATH, 'utf-8');

                // Replace dynamic placeholders
                agreementContent = agreementContent
                    .replace(/\{\{partnerName\}\}/g, partner.applicantName || partner.businessName || 'N/A')
                    .replace(/\{\{partnerId\}\}/g, partner.partnerId || 'N/A')
                    .replace(/\{\{address\}\}/g, `${partner.billingAddress?.street || ''}, ${partner.billingAddress?.city || ''}, ${partner.billingAddress?.state || ''} - ${partner.billingAddress?.pinCode || ''}`)
                    .replace(/\{\{gst\}\}/g, partner.gstNumber || 'N/A')
                    .replace(/\{\{pan\}\}/g, partner.panNumber || 'N/A')
                    .replace(/\{\{mobile\}\}/g, partner.mobile || 'N/A')
                    .replace(/\{\{email\}\}/g, partner.email || 'N/A')
                    // Replace date placeholders
                    .replace(/__\s+day\s+of\s+___,\s+20\s+/g, `${new Date().getDate()} day of ${new Date().toLocaleString('default', { month: 'long' })}, ${new Date().getFullYear()}`)
                    .replace(/__________/g, new Date().toLocaleDateString('en-IN'))
                    .replace(/_{10,}/g, '________________');

            } catch (error) {
                console.error('Failed to read Agreement MD file:', error);
                // Fallback to basic agreement text
                agreementContent = `PARTNER AGREEMENT\n\nPartner: ${partner.applicantName}\nPartner ID: ${partner.partnerId}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nThis agreement is subject to terms and conditions as communicated via the partner portal.`;
            }

            renderFormattedText(doc, agreementContent);

            // --- PAGE 2+: SLA ---
            doc.addPage();
            addWatermark(doc);

            // SLA Header
            if (fs.existsSync(LOGO_PATHS.onspot)) {
                try {
                    doc.image(LOGO_PATHS.onspot, 250, 40, { width: 100 });
                } catch (error) {
                    console.warn('OnSpot logo failed:', error.message);
                }
            }
            doc.moveDown(4);
            doc.fontSize(16).font('Helvetica-Bold').text('OnSpot™ Post-OEM Service Plans (SLAs)', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(`Issued by: ${COMPANY_INFO.legalName}`, { align: 'center' });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(2);

            // Read SLA from markdown file
            let slaContent = '';
            try {
                slaContent = fs.readFileSync(SLA_MD_PATH, 'utf-8');
            } catch (error) {
                console.error('Failed to read SLA MD file:', error);
                // Fallback to basic SLA text
                slaContent = `SERVICE LEVEL AGREEMENT\n\nThis document outlines the service plans and terms for OnSpot™ post-OEM services. Full details are available on the partner portal.`;
            }

            renderFormattedText(doc, slaContent);

            // Footer on all pages
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('gray').text(
                    `Page ${i + 1} of ${range.count} | ${partner.partnerId || 'Partner Agreement'}`,
                    50,
                    doc.page.height - 30,
                    { align: 'center' }
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
