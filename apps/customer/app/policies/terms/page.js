import Link from 'next/link';

export const metadata = {
    title: 'Terms & Conditions - OnSpot Partner Portal',
    description: 'Terms & Conditions for OnSpot Partner Portal by Ccommerce Ecosystem Pvt. Ltd.',
};

export default function TermsConditions() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Terms & Conditions</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">1. Agreement to Terms</h2>
                <p>By accessing or using the OnSpot™ Partner Portal operated by Ccommerce Ecosystem Pvt. Ltd. ("Company"), you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access the service.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>"Partner"</strong> refers to registered channel partners of OnSpot™</li>
                    <li><strong>"Services"</strong> refers to OnSpot™ service plans (ESS, EPS, CDC)</li>
                    <li><strong>"Portal"</strong> refers to partner.onspot.one</li>
                    <li><strong>"Commission"</strong> refers to earnings from service plan activations</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">3. Partner Eligibility</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Must be a registered business entity in India</li>
                    <li>Must have valid PAN and GST registration (if applicable)</li>
                    <li>Must agree to comply with all applicable laws</li>
                    <li>Must maintain accuracy of provided information</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">4. Partner Tiers & Targets</h2>
                <p>Partners are categorized into tiers based on monthly sales targets:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Silver:</strong> ₹50,000 monthly target, 10 activations/month, 20% commission</li>
                    <li><strong>Gold:</strong> ₹2,00,000 monthly target, 40 activations/month, 25% commission</li>
                    <li><strong>Platinum:</strong> ₹5,00,000 monthly target, 100 activations/month, 30% commission</li>
                </ul>
                <p className="mt-2">TDS @ 5% is deducted at source. 18% GST is applicable on all commissions.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">5. Commission Payments</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Commissions are calculated on confirmed service plan activations</li>
                    <li>Payments are processed as per tier eligibility (monthly/weekly/daily)</li>
                    <li>Partners must provide valid bank account details for NEFT/IMPS transfers</li>
                    <li>Commission disputes must be raised within 30 days of payment</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">6. Partner Obligations</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Accurately represent OnSpot™ services to customers</li>
                    <li>Not make false claims about service coverage or benefits</li>
                    <li>Maintain customer confidentiality and data protection</li>
                    <li>Comply with all applicable consumer protection laws</li>
                    <li>Not engage in fraudulent or misleading practices</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">7. Intellectual Property</h2>
                <p>OnSpot™ is a registered trademark of Ccommerce Ecosystem Pvt. Ltd. Partners are granted a limited, non-exclusive license to use OnSpot™ branding for authorized marketing purposes only.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">8. Termination</h2>
                <p>The Company may terminate partnership for:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Breach of these terms</li>
                    <li>Fraudulent activities</li>
                    <li>Failure to meet minimum targets for 3 consecutive months</li>
                    <li>Reputational damage to OnSpot™ brand</li>
                </ul>
                <p className="mt-2">Partners may terminate with 30 days written notice. Pending commissions will be settled within 45 days of termination.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">9. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, the Company shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Portal or partnership.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">10. Governing Law & Jurisdiction</h2>
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in <strong>Jind, India</strong>.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">11. Contact</h2>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p><strong>Ccommerce Ecosystem Pvt. Ltd.</strong></p>
                    <p>Email: <a href="mailto:legal@onspot.one" className="text-primary-600">legal@onspot.one</a></p>
                    <p>Phone: +91-9588576099</p>
                </div>
            </section>
        </article>
    );
}
