import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy - OnSpot Partner Portal',
    description: 'Privacy Policy for OnSpot Partner Portal by Ccommerce Ecosystem Pvt. Ltd.',
};

export default function PrivacyPolicy() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">1. Introduction</h2>
                <p>Ccommerce Ecosystem Pvt. Ltd. ("Company", "we", "us", or "our") operates the OnSpot™ Partner Portal (partner.onspot.one). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
                <p>This policy is compliant with the <strong>Information Technology Act, 2000</strong>, <strong>IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the upcoming <strong>Digital Personal Data Protection Act, 2023</strong> of India, as well as international standards including <strong>GDPR</strong> (for EU users).</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mt-4 mb-2">2.1 Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Full name, email address, mobile number</li>
                    <li>PAN card details, GST number, business registration details</li>
                    <li>Bank account information for commission payouts</li>
                    <li>Address (billing and shipping)</li>
                    <li>Government-issued identification documents</li>
                </ul>
                <h3 className="text-lg font-medium mt-4 mb-2">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                    <li>IP address, browser type, operating system</li>
                    <li>Device information, access times, pages viewed</li>
                    <li>Cookies and similar tracking technologies</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>To process partner registration and verify identity</li>
                    <li>To facilitate commission payments and generate tax documents</li>
                    <li>To provide customer support and respond to inquiries</li>
                    <li>To send administrative communications and service updates</li>
                    <li>To comply with legal obligations (GST, TDS, audit requirements)</li>
                    <li>To improve our services and user experience</li>
                    <li>To prevent fraud and ensure platform security</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Service Providers:</strong> Payment processors, cloud hosting providers, OTP service providers</li>
                    <li><strong>Government Authorities:</strong> As required by law (GST, Income Tax, legal proceedings)</li>
                    <li><strong>Business Partners:</strong> Service centers and repair networks (limited operational data)</li>
                    <li><strong>Legal Compliance:</strong> To comply with court orders, legal processes, or regulatory requirements</li>
                </ul>
                <p className="mt-4">We do NOT sell your personal information to third parties.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">5. Data Security</h2>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>SSL/TLS encryption for all data transmission</li>
                    <li>Encrypted storage of sensitive data (passwords, bank details)</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure data centers with ISO 27001 certification</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">6. Data Retention</h2>
                <p>We retain your personal data for:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Active accounts: Duration of partnership + 7 years (as per Indian tax laws)</li>
                    <li>Financial records: 8 years from transaction date</li>
                    <li>Communication logs: 3 years</li>
                    <li>Marketing data: Until consent is withdrawn</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">7. Your Rights</h2>
                <p>Under applicable data protection laws, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                    <li><strong>Portability:</strong> Request data in a machine-readable format</li>
                    <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
                    <li><strong>Lodge Complaints:</strong> File complaints with relevant data protection authorities</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">8. Cookies Policy</h2>
                <p>We use cookies and similar technologies. For details, see our <Link href="/policies/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link>.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">9. Contact Us</h2>
                <p>For privacy-related queries or to exercise your rights:</p>
                <div className="bg-slate-50 p-4 rounded-lg mt-4">
                    <p><strong>Data Protection Officer</strong></p>
                    <p>Ccommerce Ecosystem Pvt. Ltd.</p>
                    <p>Email: <a href="mailto:privacy@onspot.one" className="text-primary-600">privacy@onspot.one</a></p>
                    <p>Phone: +91-9588576099</p>
                    <p>Address: Registered Office - Jind, Haryana, India</p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">10. Updates to This Policy</h2>
                <p>We may update this policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our services after changes constitutes acceptance of the revised policy.</p>
            </section>
        </article>
    );
}
