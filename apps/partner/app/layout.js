import './globals.css';

export const metadata = {
    title: 'OnSpot™ Partner Portal | Device Protection Services',
    description: 'Join OnSpot Partner Network - Sell device protection plans (ESS, EPS, CDC) and earn attractive commissions. Authorized partner portal by Ccommerce Ecosystem Pvt. Ltd.',
    keywords: 'OnSpot, device protection, partner portal, extended warranty, mobile insurance, Ccommerce Ecosystem',
    authors: [{ name: 'Ccommerce Ecosystem Pvt. Ltd.' }],
    creator: 'Ccommerce Ecosystem Pvt. Ltd.',
    publisher: 'Ccommerce Ecosystem Pvt. Ltd.',
    robots: 'index, follow',
    openGraph: {
        title: 'OnSpot™ Partner Portal | Ccommerce Ecosystem',
        description: 'Become an authorized OnSpot partner. Sell device protection plans and earn commissions.',
        url: 'https://partner.onspot.one',
        siteName: 'OnSpot Partner Portal',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'OnSpot™ Partner Portal',
        description: 'Join the OnSpot Partner Network for device protection services.',
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#0B2545',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo.png" />
                <meta name="format-detection" content="telephone=no" />
            </head>
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
