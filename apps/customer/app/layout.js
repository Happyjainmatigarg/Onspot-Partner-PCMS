import './globals.css';

export const metadata = {
    title: 'OnSpot™ Customer Portal | Device Protection Services',
    description: 'Register and manage your device protection services with OnSpot. Get extended warranty, protection plans, and damage coverage for your devices.',
    keywords: 'OnSpot, device protection, customer portal, extended warranty, mobile insurance, damage coverage',
    authors: [{ name: 'Ccommerce Ecosystem Pvt. Ltd.' }],
    creator: 'Ccommerce Ecosystem Pvt. Ltd.',
    publisher: 'Ccommerce Ecosystem Pvt. Ltd.',
    robots: 'index, follow',
    metadataBase: new URL('https://customer.onspot.one'),
    openGraph: {
        title: 'OnSpot™ Customer Portal | Device Protection',
        description: 'Protect your devices with OnSpot. Register for extended warranty and damage coverage.',
        url: 'https://customer.onspot.one',
        siteName: 'OnSpot Customer Portal',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'OnSpot™ Customer Portal',
        description: 'Get device protection services from OnSpot.',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
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
