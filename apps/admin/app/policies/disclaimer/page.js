export const metadata = {
    title: 'Disclaimer - OnSpot Partner Portal',
    description: 'Disclaimer for OnSpot Partner Portal by Ccommerce Ecosystem Pvt. Ltd.',
};

export default function Disclaimer() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Disclaimer</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">1. Not an Insurance Product</h2>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
                    <p className="font-semibold text-amber-800">Important Notice</p>
                    <p className="text-amber-700">OnSpot™ service plans are NOT insurance products. They are service contracts that provide post-warranty repair and maintenance support. OnSpot™ is not regulated by IRDAI (Insurance Regulatory and Development Authority of India).</p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">2. Service Limitations</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Service coverage is limited to terms defined in the Service Level Agreement (SLA)</li>
                    <li>Pre-existing defects and physical damage are not covered</li>
                    <li>Services are subject to availability of parts and service center capacity</li>
                    <li>Maximum liability is limited to the invoice value of the device</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">3. No Warranty Replacement</h2>
                <p>OnSpot™ service plans do not replace:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Manufacturer warranty (OEM warranty)</li>
                    <li>Extended warranty purchased from manufacturer</li>
                    <li>Insurance coverage (theft, loss, accidental damage)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">4. Partner Earnings</h2>
                <p>Commission earnings displayed are indicative and subject to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Actual activations and customer payments</li>
                    <li>Verification and fraud checks</li>
                    <li>Applicable TDS (5%) and GST (18%) deductions</li>
                    <li>Cancellations and refunds</li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">Past performance does not guarantee future earnings.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">5. Website Information</h2>
                <p>While we strive to keep information accurate and up-to-date:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Content is provided "as is" without warranties</li>
                    <li>Pricing, terms, and availability may change without notice</li>
                    <li>Images are for illustration purposes only</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">6. Third-Party Links</h2>
                <p>Our website may contain links to external sites. We are not responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Content or accuracy of linked websites</li>
                    <li>Privacy practices of third parties</li>
                    <li>Any transactions conducted on external sites</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">7. Limitation of Liability</h2>
                <p>To the maximum extent permitted by Indian law, Ccommerce Ecosystem Pvt. Ltd. shall not be liable for:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of data, profits, or business opportunities</li>
                    <li>Service interruptions or delays beyond our control</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">8. Governing Law</h2>
                <p>This disclaimer is governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Delhi NCR.</p>
            </section>
        </article>
    );
}
