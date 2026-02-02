export const metadata = {
    title: 'Cookie Policy - OnSpot Partner Portal',
    description: 'Cookie Policy for OnSpot Partner Portal by Ccommerce Ecosystem Pvt. Ltd.',
};

export default function CookiePolicy() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Cookie Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">1. What Are Cookies?</h2>
                <p>Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your browsing experience.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">2. Types of Cookies We Use</h2>

                <h3 className="text-lg font-medium mt-4 mb-2">2.1 Essential Cookies</h3>
                <p>Required for the website to function. Cannot be disabled.</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Session management and authentication</li>
                    <li>Security tokens and CSRF protection</li>
                    <li>Load balancing and performance</li>
                </ul>

                <h3 className="text-lg font-medium mt-4 mb-2">2.2 Functional Cookies</h3>
                <p>Remember your preferences and settings.</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Language preferences</li>
                    <li>Dashboard layout preferences</li>
                    <li>Recently viewed items</li>
                </ul>

                <h3 className="text-lg font-medium mt-4 mb-2">2.3 Analytics Cookies</h3>
                <p>Help us understand how visitors use our website.</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Google Analytics (anonymized)</li>
                    <li>Page view tracking</li>
                    <li>Performance monitoring</li>
                </ul>

                <h3 className="text-lg font-medium mt-4 mb-2">2.4 Marketing Cookies</h3>
                <p>Used for targeted advertising (with consent).</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Facebook Pixel</li>
                    <li>Google Ads remarketing</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">3. Cookie Duration</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> Remain for 1-365 days depending on purpose</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">4. Managing Cookies</h2>
                <p>You can control cookies through:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Browser settings (Chrome, Firefox, Safari, Edge)</li>
                    <li>Our cookie consent banner</li>
                    <li>Third-party opt-out tools (Google Ad Settings, Facebook Ad Preferences)</li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">Note: Disabling essential cookies may affect website functionality.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">5. Third-Party Cookies</h2>
                <p>Some third-party services may set their own cookies:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Payment processors (Razorpay/PayU)</li>
                    <li>Analytics providers (Google Analytics)</li>
                    <li>Social media platforms</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">6. Updates to This Policy</h2>
                <p>We may update this Cookie Policy periodically. Changes will be posted on this page with an updated date.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary-600 mt-8 mb-4">7. Contact</h2>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p>For cookie-related queries:</p>
                    <p>Email: <a href="mailto:privacy@onspot.one" className="text-primary-600">privacy@onspot.one</a></p>
                </div>
            </section>
        </article>
    );
}
