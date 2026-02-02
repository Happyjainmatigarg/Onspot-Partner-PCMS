export const metadata = {
    title: 'Refund & Cancellation Policy - OnSpot Partner Portal',
    description: 'Refund & Cancellation Policy for OnSpot Partner Portal by Ccommerce Ecosystem Pvt. Ltd.',
};

export default function RefundPolicy() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Refund & Cancellation Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">1. Partner Commission Refunds</h2>
                <p>Partner commissions are subject to the following refund conditions:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>If a customer cancels their service plan within the cooling-off period (14 days), the corresponding commission will be reversed</li>
                    <li>Fraudulent activations identified during audit will result in commission reversal and potential account termination</li>
                    <li>Overpayments due to system errors will be adjusted in subsequent payment cycles</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">2. Customer Service Plan Cancellations</h2>
                <p>End customers purchasing OnSpot™ service plans may cancel under the following terms:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Cooling-off Period:</strong> Full refund within 14 days of purchase if no claims filed</li>
                    <li><strong>15-30 Days:</strong> 80% refund if no claims filed</li>
                    <li><strong>31-60 Days:</strong> 50% refund if no claims filed</li>
                    <li><strong>After 60 Days:</strong> No refund available</li>
                    <li><strong>Post-Claim:</strong> No refund after any claim is processed</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">3. Refund Processing</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Refunds are processed within 7-10 business days of approval</li>
                    <li>Refunds are credited to the original payment method</li>
                    <li>Bank processing time may add 3-5 additional days</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">4. Partnership Termination</h2>
                <p>Upon partner account termination:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Pending verified commissions will be paid within 45 days</li>
                    <li>Unverified or disputed commissions may be withheld pending resolution</li>
                    <li>Partners must return any marketing materials or assets provided</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">5. How to Request a Refund</h2>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p>Email: <a href="mailto:refunds@onspot.one" className="text-primary-600">refunds@onspot.one</a></p>
                    <p>Phone: +91-9588576099</p>
                    <p>Response Time: 2-3 business days</p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">6. Non-Refundable Items</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Service charges for completed repairs</li>
                    <li>Commissions on valid, uncancelled activations beyond 60 days</li>
                    <li>Administrative fees (if any)</li>
                </ul>
            </section>
        </article>
    );
}
